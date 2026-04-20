package com.example.CrowdFunding.repository;

import com.example.CrowdFunding.entity.EscrowHolding;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EscrowHoldingRepository extends JpaRepository<EscrowHolding, Long> {
    Optional<EscrowHolding> findByCampaignId(Long campaignId);
}

