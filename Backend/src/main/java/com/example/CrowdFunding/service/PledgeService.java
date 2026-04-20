package com.example.CrowdFunding.service;

import com.example.CrowdFunding.dto.request.CreatePledgeRequest;
import com.example.CrowdFunding.dto.response.PledgeResponse;
import com.example.CrowdFunding.entity.Campaign;
import com.example.CrowdFunding.entity.Pledge;
import com.example.CrowdFunding.entity.User;
import com.example.CrowdFunding.enums.CampaignStatus;
import com.example.CrowdFunding.enums.PledgeStatus;
import com.example.CrowdFunding.enums.UserRole;
import com.example.CrowdFunding.exception.BusinessRuleException;
import com.example.CrowdFunding.exception.ResourceNotFoundException;
import com.example.CrowdFunding.exception.UnauthorizedActionException;
import com.example.CrowdFunding.repository.CampaignRepository;
import com.example.CrowdFunding.repository.PledgeRepository;
import com.example.CrowdFunding.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class PledgeService {

    private final PledgeRepository pledgeRepository;
    private final CampaignRepository campaignRepository;
    private final UserRepository userRepository;
    private final CampaignService campaignService;
    private final EscrowService escrowService;
    private final MilestoneService milestoneService;
    private final ActivityLogService activityLogService;

    public PledgeService(PledgeRepository pledgeRepository,
                         CampaignRepository campaignRepository,
                         UserRepository userRepository,
                         CampaignService campaignService,
                         EscrowService escrowService,
                         MilestoneService milestoneService,
                         ActivityLogService activityLogService) {
        this.pledgeRepository = pledgeRepository;
        this.campaignRepository = campaignRepository;
        this.userRepository = userRepository;
        this.campaignService = campaignService;
        this.escrowService = escrowService;
        this.milestoneService = milestoneService;
        this.activityLogService = activityLogService;
    }

    // ─── CREATE PLEDGE ───────────────────────────────────────────────────────

    public PledgeResponse createPledge(CreatePledgeRequest req, String backerEmail) {
        User backer = userByEmail(backerEmail);

        if (backer.getRole() != UserRole.BACKER) {
            throw new UnauthorizedActionException("Only BACKER role can pledge");
        }

        Campaign campaign = campaignService.getOrThrow(req.getCampaignId());

        if (campaign.getStatus() != CampaignStatus.ACTIVE) {
            throw new BusinessRuleException(
                    "Pledges only allowed for ACTIVE campaigns. Current: " + campaign.getStatus());
        }
        if (campaign.getCampaigner().getId().equals(backer.getId())) {
            throw new UnauthorizedActionException("Campaigners cannot pledge to their own campaign");
        }
        if (LocalDate.now().isAfter(campaign.getEndDate())) {
            throw new BusinessRuleException("Campaign funding period has ended");
        }

        // Overfunding cap: total pledged must not exceed 1.5× goal
        BigDecimal cap = campaign.getFundingGoal().multiply(new BigDecimal("1.5"));
        BigDecimal projected = campaign.getTotalPledged().add(req.getAmount());
        if (projected.compareTo(cap) > 0) {
            throw new BusinessRuleException(
                    "Pledge would exceed overfunding cap of 1.5× goal (" + cap + ")");
        }

        // Save pledge
        Pledge pledge = Pledge.builder()
                .backer(backer)
                .campaign(campaign)
                .amount(req.getAmount())
                .status(PledgeStatus.COMPLETED)
                .build();
        pledge = pledgeRepository.save(pledge);

        // Update campaign.totalPledged and persist
        campaign.setTotalPledged(campaign.getTotalPledged().add(req.getAmount()));
        campaignRepository.save(campaign);

        // Credit escrow
        escrowService.addFunds(campaign.getId(), req.getAmount());

        activityLogService.log(campaign, backer, "PLEDGE_CREATED", "Pledged ₹" + req.getAmount());

        // Auto-advance ACTIVE → FUNDED → IN_PROGRESS if goal reached
        checkAndMarkFunded(campaign);

        return toResponse(pledge);
    }

    // ─── CANCEL PLEDGE ───────────────────────────────────────────────────────

    public PledgeResponse cancelPledge(Long pledgeId, String backerEmail) {
        Pledge pledge = getOrThrow(pledgeId);
        User caller = userByEmail(backerEmail);

        if (!pledge.getBacker().getId().equals(caller.getId())) {
            throw new UnauthorizedActionException("You can only cancel your own pledge");
        }
        if (pledge.getStatus() != PledgeStatus.COMPLETED) {
            throw new BusinessRuleException(
                    "Only COMPLETED pledges can be cancelled. Current: " + pledge.getStatus());
        }

        Campaign campaign = pledge.getCampaign();
        if (LocalDate.now().isAfter(campaign.getEndDate())) {
            throw new BusinessRuleException("Cannot cancel pledge after campaign end date");
        }
        CampaignStatus st = campaign.getStatus();
        if (st == CampaignStatus.FUNDED || st == CampaignStatus.IN_PROGRESS
                || st == CampaignStatus.COMPLETED) {
            throw new BusinessRuleException("Cannot cancel pledge after campaign is funded");
        }

        pledge.setStatus(PledgeStatus.CANCELLED);
        pledge = pledgeRepository.save(pledge);

        // Reverse campaign total and escrow
        campaign.setTotalPledged(campaign.getTotalPledged().subtract(pledge.getAmount()));
        campaignRepository.save(campaign);
        escrowService.removeFunds(campaign.getId(), pledge.getAmount());

        activityLogService.log(campaign, caller, "PLEDGE_CANCELLED",
                "Pledge " + pledgeId + " cancelled; ₹" + pledge.getAmount() + " removed from escrow");
        return toResponse(pledge);
    }

    // ─── QUERIES ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<PledgeResponse> getAll() {
        return pledgeRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<PledgeResponse> getByCampaign(Long campaignId) {
        return pledgeRepository.findByCampaignId(campaignId)
                .stream().map(this::toResponse).toList();
    }

    // ─── INTERNAL ────────────────────────────────────────────────────────────

    private void checkAndMarkFunded(Campaign campaign) {
        if (campaign.getStatus() != CampaignStatus.ACTIVE) return;
        if (campaign.getTotalPledged().compareTo(campaign.getFundingGoal()) >= 0) {

            campaign.setStatus(CampaignStatus.FUNDED);
            campaignRepository.save(campaign);
            activityLogService.log(campaign, null, "FUNDED",
                    "Funding goal reached: ₹" + campaign.getTotalPledged());

            campaign.setStatus(CampaignStatus.IN_PROGRESS);
            campaignRepository.save(campaign);
            activityLogService.log(campaign, null, "IN_PROGRESS",
                    "Campaign moved to IN_PROGRESS; first milestone unlocked");

            milestoneService.unlockFirstMilestone(campaign.getId());
        }
    }

    private Pledge getOrThrow(Long id) {
        return pledgeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pledge not found: " + id));
    }

    private User userByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private PledgeResponse toResponse(Pledge p) {
        return PledgeResponse.builder()
                .id(p.getId())
                .campaignId(p.getCampaign().getId())
                .backerId(p.getBacker().getId())
                .amount(p.getAmount())
                .status(p.getStatus())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
