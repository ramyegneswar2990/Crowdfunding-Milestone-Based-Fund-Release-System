package com.example.CrowdFunding.service;

import com.example.CrowdFunding.dto.request.CreateCampaignRequest;
import com.example.CrowdFunding.dto.response.CampaignResponse;
import com.example.CrowdFunding.entity.Campaign;
import com.example.CrowdFunding.entity.EscrowHolding;
import com.example.CrowdFunding.entity.User;
import com.example.CrowdFunding.enums.CampaignStatus;
import com.example.CrowdFunding.enums.PledgeStatus;
import com.example.CrowdFunding.enums.UserRole;
import com.example.CrowdFunding.exception.BusinessRuleException;
import com.example.CrowdFunding.exception.ResourceNotFoundException;
import com.example.CrowdFunding.exception.UnauthorizedActionException;
import com.example.CrowdFunding.repository.CampaignRepository;
import com.example.CrowdFunding.repository.EscrowHoldingRepository;
import com.example.CrowdFunding.repository.PledgeRepository;
import com.example.CrowdFunding.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@Transactional
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final UserRepository userRepository;
    private final EscrowHoldingRepository escrowHoldingRepository;
    private final PledgeRepository pledgeRepository;
    private final ActivityLogService activityLogService;

    public CampaignService(CampaignRepository campaignRepository,
                           UserRepository userRepository,
                           EscrowHoldingRepository escrowHoldingRepository,
                           PledgeRepository pledgeRepository,
                           ActivityLogService activityLogService) {
        this.campaignRepository = campaignRepository;
        this.userRepository = userRepository;
        this.escrowHoldingRepository = escrowHoldingRepository;
        this.pledgeRepository = pledgeRepository;
        this.activityLogService = activityLogService;
    }

    // ─── CREATE ─────────────────────────────────────────────────────────────

    public CampaignResponse createCampaign(CreateCampaignRequest req, String campaignerEmail) {
        User campaigner = userByEmail(campaignerEmail);

        if (campaigner.getRole() != UserRole.CAMPAIGNER) {
            throw new UnauthorizedActionException("Only CAMPAIGNER role can create campaigns");
        }

        long days = ChronoUnit.DAYS.between(req.getStartDate(), req.getEndDate());
        if (days < 7 || days > 60) {
            throw new BusinessRuleException("Campaign duration must be 7–60 days (got " + days + ")");
        }
        if (req.getEndDate().isBefore(req.getStartDate())) {
            throw new BusinessRuleException("End date must be after start date");
        }

        Campaign campaign = Campaign.builder()
                .campaigner(campaigner)
                .title(req.getTitle())
                .description(req.getDescription())
                .fundingGoal(req.getFundingGoal())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .status(CampaignStatus.DRAFT)
                .totalPledged(BigDecimal.ZERO)
                .totalReleased(BigDecimal.ZERO)
                .build();
        campaign = campaignRepository.save(campaign);

        // Auto-initialize escrow with zero balances
        EscrowHolding escrow = EscrowHolding.builder()
                .campaign(campaign)
                .totalHeld(BigDecimal.ZERO)
                .totalReleased(BigDecimal.ZERO)
                .remaining(BigDecimal.ZERO)
                .build();
        escrowHoldingRepository.save(escrow);

        activityLogService.log(campaign, campaigner, "CREATED", "Campaign created in DRAFT status");
        return toResponse(campaign);
    }

    // ─── STATE TRANSITIONS ───────────────────────────────────────────────────

    public CampaignResponse submitForApproval(Long campaignId, String callerEmail) {
        Campaign campaign = getOrThrow(campaignId);
        User caller = userByEmail(callerEmail);

        if (!campaign.getCampaigner().getId().equals(caller.getId())) {
            throw new UnauthorizedActionException("Only the campaign owner can submit for approval");
        }
        if (campaign.getStatus() != CampaignStatus.DRAFT) {
            throw new BusinessRuleException("Campaign must be DRAFT to submit. Current: " + campaign.getStatus());
        }

        campaign.setStatus(CampaignStatus.PENDING_APPROVAL);
        campaign = campaignRepository.save(campaign);
        activityLogService.log(campaign, caller, "SUBMITTED", "Submitted for admin approval");
        return toResponse(campaign);
    }

    public CampaignResponse approveCampaign(Long campaignId, String callerEmail) {
        Campaign campaign = getOrThrow(campaignId);
        User caller = userByEmail(callerEmail);

        if (caller.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedActionException("Only ADMIN can approve campaigns");
        }
        if (campaign.getStatus() != CampaignStatus.PENDING_APPROVAL) {
            throw new BusinessRuleException("Campaign must be PENDING_APPROVAL to approve. Current: " + campaign.getStatus());
        }

        campaign.setStatus(CampaignStatus.ACTIVE);
        campaign = campaignRepository.save(campaign);
        activityLogService.log(campaign, caller, "APPROVED", "Campaign approved and set ACTIVE");
        return toResponse(campaign);
    }

    public CampaignResponse cancelCampaign(Long campaignId, String callerEmail) {
        Campaign campaign = getOrThrow(campaignId);
        User caller = userByEmail(callerEmail);

        boolean isAdmin = caller.getRole() == UserRole.ADMIN;
        boolean isOwner = campaign.getCampaigner().getId().equals(caller.getId());
        if (!isAdmin && !isOwner) {
            throw new UnauthorizedActionException("Only ADMIN or the campaign owner can cancel");
        }
        if (campaign.getStatus() == CampaignStatus.COMPLETED) {
            throw new BusinessRuleException("Completed campaigns cannot be cancelled");
        }

        campaign.setStatus(CampaignStatus.CANCELLED);
        campaign = campaignRepository.save(campaign);

        // Refund all COMPLETED pledges
        pledgeRepository.findByCampaignIdAndStatus(campaignId, PledgeStatus.COMPLETED)
                .forEach(p -> {
                    p.setStatus(PledgeStatus.REFUNDED);
                    pledgeRepository.save(p);
                });

        activityLogService.log(campaign, caller, "CANCELLED",
                "Campaign cancelled; COMPLETED pledges marked REFUNDED");
        return toResponse(campaign);
    }

    // ─── QUERIES ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CampaignResponse> getAll() {
        return campaignRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<CampaignResponse> getActive() {
        return campaignRepository.findByStatus(CampaignStatus.ACTIVE)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CampaignResponse getById(Long id) {
        return toResponse(getOrThrow(id));
    }

    // ─── INTERNAL (called by PledgeService / FundReleaseService) ────────────

    public void markCompleted(Campaign campaign, User actor) {
        campaign.setStatus(CampaignStatus.COMPLETED);
        campaignRepository.save(campaign);
        activityLogService.log(campaign, actor, "COMPLETED",
                "All milestones released — campaign COMPLETED");
    }

    public Campaign getOrThrow(Long id) {
        return campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found: " + id));
    }

    // ─── MAPPING ─────────────────────────────────────────────────────────────

    private User userByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private CampaignResponse toResponse(Campaign c) {
        return CampaignResponse.builder()
                .id(c.getId())
                .campaignerId(c.getCampaigner().getId())
                .title(c.getTitle())
                .description(c.getDescription())
                .fundingGoal(c.getFundingGoal())
                .totalPledged(c.getTotalPledged())
                .totalReleased(c.getTotalReleased())
                .status(c.getStatus())
                .startDate(c.getStartDate())
                .endDate(c.getEndDate())
                .build();
    }
}
