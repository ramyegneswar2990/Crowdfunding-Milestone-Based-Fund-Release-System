package com.example.CrowdFunding.repository;

import com.example.CrowdFunding.entity.Pledge;
import com.example.CrowdFunding.enums.PledgeStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PledgeRepository extends JpaRepository<Pledge, Long> {
    List<Pledge> findByCampaignId(Long campaignId);

    List<Pledge> findByBackerId(Long backerId);

    List<Pledge> findByCampaignIdAndStatus(Long campaignId, PledgeStatus status);
}

