package com.example.CrowdFunding.repository;

import com.example.CrowdFunding.entity.Milestone;
import com.example.CrowdFunding.enums.MilestoneStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MilestoneRepository extends JpaRepository<Milestone, Long> {
    List<Milestone> findByCampaignIdOrderBySequenceNumberAsc(Long campaignId);

    List<Milestone> findByCampaignIdAndStatus(Long campaignId, MilestoneStatus status);
}

