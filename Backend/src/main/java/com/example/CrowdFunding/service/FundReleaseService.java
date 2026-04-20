package com.example.CrowdFunding.service;

import com.example.CrowdFunding.dto.response.TransactionResponse;
import com.example.CrowdFunding.entity.Campaign;
import com.example.CrowdFunding.entity.FundReleaseTransaction;
import com.example.CrowdFunding.entity.Milestone;
import com.example.CrowdFunding.entity.User;
import com.example.CrowdFunding.enums.MilestoneStatus;
import com.example.CrowdFunding.enums.UserRole;
import com.example.CrowdFunding.exception.BusinessRuleException;
import com.example.CrowdFunding.exception.ResourceNotFoundException;
import com.example.CrowdFunding.exception.UnauthorizedActionException;
import com.example.CrowdFunding.repository.CampaignRepository;
import com.example.CrowdFunding.repository.FundReleaseTransactionRepository;
import com.example.CrowdFunding.repository.MilestoneRepository;
import com.example.CrowdFunding.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class FundReleaseService {

    private final FundReleaseTransactionRepository txnRepository;
    private final MilestoneRepository milestoneRepository;
    private final CampaignRepository campaignRepository;
    private final UserRepository userRepository;
    private final EscrowService escrowService;
    private final CampaignService campaignService;
    private final ActivityLogService activityLogService;

    public FundReleaseService(FundReleaseTransactionRepository txnRepository,
                              MilestoneRepository milestoneRepository,
                              CampaignRepository campaignRepository,
                              UserRepository userRepository,
                              EscrowService escrowService,
                              CampaignService campaignService,
                              ActivityLogService activityLogService) {
        this.txnRepository = txnRepository;
        this.milestoneRepository = milestoneRepository;
        this.campaignRepository = campaignRepository;
        this.userRepository = userRepository;
        this.escrowService = escrowService;
        this.campaignService = campaignService;
        this.activityLogService = activityLogService;
    }

    // ─── RELEASE ─────────────────────────────────────────────────────────────

    public TransactionResponse releaseFunds(Long milestoneId, String adminEmail) {
        User admin = userByEmail(adminEmail);
        if (admin.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedActionException("Only ADMIN can release funds");
        }

        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone not found: " + milestoneId));

        // Guard 1: milestone must be VERIFIED
        if (milestone.getStatus() != MilestoneStatus.VERIFIED) {
            throw new BusinessRuleException(
                    "Milestone must be VERIFIED before release. Current: " + milestone.getStatus());
        }

        // Guard 2: prevent double-release
        if (txnRepository.existsByMilestoneId(milestoneId)) {
            throw new BusinessRuleException("Funds for milestone " + milestoneId + " already released");
        }

        Campaign campaign = milestone.getCampaign();

        // Guard 3: escrow balance >= release amount (checked inside deductFunds)
        escrowService.deductFunds(campaign.getId(), milestone.getAmountToRelease());

        // Update campaign.totalReleased
        campaign.setTotalReleased(campaign.getTotalReleased().add(milestone.getAmountToRelease()));
        campaignRepository.save(campaign);

        // Mark milestone RELEASED
        milestone.setStatus(MilestoneStatus.RELEASED);
        milestoneRepository.save(milestone);

        // Persist transaction record
        FundReleaseTransaction txn = FundReleaseTransaction.builder()
                .campaign(campaign)
                .milestone(milestone)
                .amountReleased(milestone.getAmountToRelease())
                .build();
        txn = txnRepository.save(txn);

        activityLogService.log(campaign, admin, "FUNDS_RELEASED",
                "Released ₹" + milestone.getAmountToRelease()
                        + " for milestone #" + milestone.getSequenceNumber());

        // If all milestones are RELEASED → campaign COMPLETED
        checkAndMarkCompleted(campaign, admin);

        return toResponse(txn);
    }

    // ─── LIST ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionsByCampaign(Long campaignId) {
        return txnRepository.findByCampaignIdOrderByReleasedAtAsc(campaignId)
                .stream().map(this::toResponse).toList();
    }

    // ─── INTERNAL ────────────────────────────────────────────────────────────

    private void checkAndMarkCompleted(Campaign campaign, User actor) {
        List<Milestone> all = milestoneRepository
                .findByCampaignIdOrderBySequenceNumberAsc(campaign.getId());
        if (!all.isEmpty() && all.stream().allMatch(m -> m.getStatus() == MilestoneStatus.RELEASED)) {
            campaignService.markCompleted(campaign, actor);
        }
    }

    private User userByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private TransactionResponse toResponse(FundReleaseTransaction t) {
        return TransactionResponse.builder()
                .id(t.getId())
                .campaignId(t.getCampaign().getId())
                .milestoneId(t.getMilestone().getId())
                .amountReleased(t.getAmountReleased())
                .releasedAt(t.getReleasedAt())
                .build();
    }
}
