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


    public TransactionResponse releaseFunds(Long milestoneId, String adminEmail) {
        User admin = userByEmail(adminEmail);
        if (admin.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedActionException("Only ADMIN can release funds");
        }

        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone not found: " + milestoneId));

        if (milestone.getStatus() != MilestoneStatus.VERIFIED) {
            throw new BusinessRuleException(
                    "Milestone must be VERIFIED before release. Current: " + milestone.getStatus());
        }

        if (txnRepository.existsByMilestoneId(milestoneId)) {
            throw new BusinessRuleException("Funds for milestone " + milestoneId + " already released");
        }

        return releaseVerifiedMilestone(milestone, admin, "FUNDS_RELEASED");
    }

    public TransactionResponse autoReleaseForVerifiedMilestone(Milestone milestone, User verifier) {
        if (verifier.getRole() != UserRole.VERIFIER) {
            throw new UnauthorizedActionException("Only VERIFIER can trigger auto-release in this flow");
        }
        if (milestone.getStatus() != MilestoneStatus.VERIFIED) {
            throw new BusinessRuleException(
                    "Milestone must be VERIFIED before auto-release. Current: " + milestone.getStatus());
        }
        if (txnRepository.existsByMilestoneId(milestone.getId())) {
            throw new BusinessRuleException("Funds for milestone " + milestone.getId() + " already released");
        }

        return releaseVerifiedMilestone(milestone, verifier, "FUNDS_RELEASED_AUTO");
    }


    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionsByCampaign(Long campaignId) {
        return txnRepository.findByCampaignIdOrderByReleasedAtAsc(campaignId)
                .stream().map(this::toResponse).toList();
    }


    private void checkAndMarkCompleted(Campaign campaign, User actor) {
        List<Milestone> all = milestoneRepository
                .findByCampaignIdOrderBySequenceNumberAsc(campaign.getId());
        if (!all.isEmpty() && all.stream().allMatch(m -> m.getStatus() == MilestoneStatus.RELEASED)) {
            campaignService.markCompleted(campaign, actor);
        }
    }

    private TransactionResponse releaseVerifiedMilestone(Milestone milestone, User actor, String actionCode) {
        Campaign campaign = milestone.getCampaign();

        if (campaign.getTotalReleased().add(milestone.getAmountToRelease()).compareTo(campaign.getTotalPledged()) > 0) {
            throw new BusinessRuleException("Milestone release exceeds available pledged funds");
        }

        escrowService.deductFunds(campaign.getId(), milestone.getAmountToRelease());

        campaign.setTotalReleased(campaign.getTotalReleased().add(milestone.getAmountToRelease()));
        campaignRepository.save(campaign);

        milestone.setStatus(MilestoneStatus.RELEASED);
        milestoneRepository.save(milestone);

        FundReleaseTransaction txn = FundReleaseTransaction.builder()
                .campaign(campaign)
                .milestone(milestone)
                .amountReleased(milestone.getAmountToRelease())
                .build();
        txn = txnRepository.save(txn);

        activityLogService.log(campaign, actor, actionCode,
                "Released ₹" + milestone.getAmountToRelease()
                        + " for milestone #" + milestone.getSequenceNumber());

        checkAndMarkCompleted(campaign, actor);
        return toResponse(txn);
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
