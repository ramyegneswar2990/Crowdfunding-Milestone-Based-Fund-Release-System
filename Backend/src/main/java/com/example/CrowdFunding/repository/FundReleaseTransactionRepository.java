package com.example.CrowdFunding.repository;

import com.example.CrowdFunding.entity.FundReleaseTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FundReleaseTransactionRepository extends JpaRepository<FundReleaseTransaction, Long> {
    List<FundReleaseTransaction> findByCampaignIdOrderByReleasedAtAsc(Long campaignId);

    boolean existsByMilestoneId(Long milestoneId);
}

