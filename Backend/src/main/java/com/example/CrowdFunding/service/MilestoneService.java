package com.example.CrowdFunding.service;

import com.example.CrowdFunding.dto.request.CreateMilestoneRequest;
import com.example.CrowdFunding.dto.response.MilestoneResponse;
import com.example.CrowdFunding.entity.Campaign;
import com.example.CrowdFunding.entity.Milestone;
import com.example.CrowdFunding.entity.User;
import com.example.CrowdFunding.enums.CampaignStatus;
import com.example.CrowdFunding.enums.MilestoneStatus;
import com.example.CrowdFunding.enums.UserRole;
import com.example.CrowdFunding.exception.BusinessRuleException;
import com.example.CrowdFunding.exception.ResourceNotFoundException;
import com.example.CrowdFunding.exception.UnauthorizedActionException;
import com.example.CrowdFunding.repository.MilestoneRepository;
import com.example.CrowdFunding.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@Transactional
public class MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final UserRepository userRepository;
    private final CampaignService campaignService;
    private final ActivityLogService activityLogService;

    public MilestoneService(MilestoneRepository milestoneRepository,
                            UserRepository userRepository,
                            CampaignService campaignService,
                            ActivityLogService activityLogService) {
        this.milestoneRepository = milestoneRepository;
        this.userRepository = userRepository;
        this.campaignService = campaignService;
        this.activityLogService = activityLogService;
    }

    // ─── CREATE ─────────────────────────────────────────────────────────────

    public MilestoneResponse createMilestone(CreateMilestoneRequest req, String callerEmail) {
        User caller = userByEmail(callerEmail);
        if (caller.getRole() != UserRole.CAMPAIGNER) {
            throw new UnauthorizedActionException("Only CAMPAIGNER can create milestones");
        }

        Campaign campaign = campaignService.getOrThrow(req.getCampaignId());

        if (!campaign.getCampaigner().getId().equals(caller.getId())) {
            throw new UnauthorizedActionException("You can only add milestones to your own campaign");
        }

        CampaignStatus st = campaign.getStatus();
        if (st != CampaignStatus.DRAFT && st != CampaignStatus.PENDING_APPROVAL) {
            throw new BusinessRuleException(
                    "Milestones can only be added when campaign is DRAFT or PENDING_APPROVAL. Current: " + st);
        }

        long count = milestoneRepository
                .findByCampaignIdOrderBySequenceNumberAsc(campaign.getId()).size();
        if (count >= 10) {
            throw new BusinessRuleException("A campaign cannot have more than 10 milestones");
        }

        Milestone milestone = Milestone.builder()
                .campaign(campaign)
                .sequenceNumber(req.getSequenceNumber())
                .title(req.getTitle())
                .description(req.getDescription())
                .amountToRelease(req.getAmountToRelease())
                .status(MilestoneStatus.LOCKED)
                .build();
        milestone = milestoneRepository.save(milestone);

        activityLogService.log(campaign, caller, "MILESTONE_CREATED",
                "Milestone #" + req.getSequenceNumber() + " '" + req.getTitle() + "' created");
        return toResponse(milestone);
    }

    // ─── SUBMIT ──────────────────────────────────────────────────────────────

    public MilestoneResponse submitMilestone(Long milestoneId, String callerEmail) {
        Milestone m = getOrThrow(milestoneId);
        User caller = userByEmail(callerEmail);

        if (!m.getCampaign().getCampaigner().getId().equals(caller.getId())) {
            throw new UnauthorizedActionException("Only the campaign owner can submit milestones");
        }
        if (m.getStatus() != MilestoneStatus.ACTIVE && m.getStatus() != MilestoneStatus.REJECTED) {
            throw new BusinessRuleException(
                    "Milestone must be ACTIVE or REJECTED to submit. Current: " + m.getStatus());
        }

        m.setStatus(MilestoneStatus.SUBMITTED);
        m.setSubmittedAt(Instant.now());
        m = milestoneRepository.save(m);

        activityLogService.log(m.getCampaign(), caller, "MILESTONE_SUBMITTED",
                "Milestone #" + m.getSequenceNumber() + " submitted for verification");
        return toResponse(m);
    }

    // ─── VERIFY ──────────────────────────────────────────────────────────────

    public MilestoneResponse verifyMilestone(Long milestoneId, String callerEmail) {
        Milestone m = getOrThrow(milestoneId);
        User caller = userByEmail(callerEmail);

        if (caller.getRole() != UserRole.VERIFIER) {
            throw new UnauthorizedActionException("Only VERIFIER role can verify milestones");
        }
        if (m.getStatus() != MilestoneStatus.SUBMITTED) {
            throw new BusinessRuleException(
                    "Milestone must be SUBMITTED to verify. Current: " + m.getStatus());
        }

        m.setStatus(MilestoneStatus.VERIFIED);
        m.setVerifiedAt(Instant.now());
        m.setVerifiedBy(caller);
        m = milestoneRepository.save(m);

        activityLogService.log(m.getCampaign(), caller, "MILESTONE_VERIFIED",
                "Milestone #" + m.getSequenceNumber() + " verified by " + caller.getEmail());

        // Unlock next milestone in sequence
        unlockNext(m);
        return toResponse(m);
    }

    // ─── REJECT ──────────────────────────────────────────────────────────────

    public MilestoneResponse rejectMilestone(Long milestoneId, String callerEmail) {
        Milestone m = getOrThrow(milestoneId);
        User caller = userByEmail(callerEmail);

        if (caller.getRole() != UserRole.VERIFIER) {
            throw new UnauthorizedActionException("Only VERIFIER role can reject milestones");
        }
        if (m.getStatus() != MilestoneStatus.SUBMITTED) {
            throw new BusinessRuleException(
                    "Milestone must be SUBMITTED to reject. Current: " + m.getStatus());
        }

        m.setStatus(MilestoneStatus.REJECTED);
        m.setVerifiedBy(caller);
        m = milestoneRepository.save(m);

        activityLogService.log(m.getCampaign(), caller, "MILESTONE_REJECTED",
                "Milestone #" + m.getSequenceNumber() + " rejected — re-submission allowed");
        return toResponse(m);
    }

    // ─── LIST ────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<MilestoneResponse> getByCampaign(Long campaignId) {
        return milestoneRepository.findByCampaignIdOrderBySequenceNumberAsc(campaignId)
                .stream().map(this::toResponse).toList();
    }

    // ─── INTERNAL ────────────────────────────────────────────────────────────

    /** Called by PledgeService when campaign transitions to IN_PROGRESS. */
    public void unlockFirstMilestone(Long campaignId) {
        milestoneRepository.findByCampaignIdOrderBySequenceNumberAsc(campaignId)
                .stream()
                .filter(m -> m.getSequenceNumber() == 1)
                .findFirst()
                .ifPresent(m -> {
                    m.setStatus(MilestoneStatus.ACTIVE);
                    milestoneRepository.save(m);
                });
    }

    private void unlockNext(Milestone current) {
        int nextSeq = current.getSequenceNumber() + 1;
        milestoneRepository.findByCampaignIdOrderBySequenceNumberAsc(current.getCampaign().getId())
                .stream()
                .filter(m -> m.getSequenceNumber() == nextSeq)
                .findFirst()
                .ifPresent(m -> {
                    m.setStatus(MilestoneStatus.ACTIVE);
                    milestoneRepository.save(m);
                });
    }

    public Milestone getOrThrow(Long id) {
        return milestoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone not found: " + id));
    }

    private User userByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private MilestoneResponse toResponse(Milestone m) {
        return MilestoneResponse.builder()
                .id(m.getId())
                .campaignId(m.getCampaign().getId())
                .sequenceNumber(m.getSequenceNumber())
                .title(m.getTitle())
                .description(m.getDescription())
                .amountToRelease(m.getAmountToRelease())
                .status(m.getStatus())
                .build();
    }
}
