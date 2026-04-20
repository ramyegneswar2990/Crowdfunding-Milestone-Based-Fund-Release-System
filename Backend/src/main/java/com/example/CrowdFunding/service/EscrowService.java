package com.example.CrowdFunding.service;

import com.example.CrowdFunding.dto.response.EscrowResponse;
import com.example.CrowdFunding.entity.EscrowHolding;
import com.example.CrowdFunding.exception.BusinessRuleException;
import com.example.CrowdFunding.exception.ResourceNotFoundException;
import com.example.CrowdFunding.repository.EscrowHoldingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@Transactional
public class EscrowService {

    private final EscrowHoldingRepository escrowRepo;

    public EscrowService(EscrowHoldingRepository escrowRepo) {
        this.escrowRepo = escrowRepo;
    }

    /** Called by PledgeService on pledge creation — adds to totalHeld and remaining. */
    public void addFunds(Long campaignId, BigDecimal amount) {
        EscrowHolding e = getOrThrow(campaignId);
        e.setTotalHeld(e.getTotalHeld().add(amount));
        e.setRemaining(e.getRemaining().add(amount));
        escrowRepo.save(e);
    }

    /** Called by PledgeService on pledge cancellation — subtracts from totalHeld and remaining. */
    public void removeFunds(Long campaignId, BigDecimal amount) {
        EscrowHolding e = getOrThrow(campaignId);
        if (e.getRemaining().compareTo(amount) < 0) {
            throw new BusinessRuleException("Escrow balance insufficient to remove funds");
        }
        e.setTotalHeld(e.getTotalHeld().subtract(amount));
        e.setRemaining(e.getRemaining().subtract(amount));
        escrowRepo.save(e);
    }

    /**
     * Called by FundReleaseService — deducts from remaining and increments totalReleased.
     * Guard: balance must be >= amount before deducting.
     */
    public void deductFunds(Long campaignId, BigDecimal amount) {
        EscrowHolding e = getOrThrow(campaignId);
        if (e.getRemaining().compareTo(amount) < 0) {
            throw new BusinessRuleException(
                    "Escrow balance " + e.getRemaining() + " < release amount " + amount);
        }
        e.setTotalReleased(e.getTotalReleased().add(amount));
        e.setRemaining(e.getRemaining().subtract(amount));
        escrowRepo.save(e);
    }

    @Transactional(readOnly = true)
    public EscrowResponse getEscrow(Long campaignId) {
        EscrowHolding e = getOrThrow(campaignId);
        return EscrowResponse.builder()
                .campaignId(e.getCampaign().getId())
                .totalHeld(e.getTotalHeld())
                .totalReleased(e.getTotalReleased())
                .remaining(e.getRemaining())
                .build();
    }

    private EscrowHolding getOrThrow(Long campaignId) {
        return escrowRepo.findByCampaignId(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Escrow not found for campaign: " + campaignId));
    }
}
