package com.example.CrowdFunding.repository;

import com.example.CrowdFunding.entity.CampaignActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CampaignActivityLogRepository extends JpaRepository<CampaignActivityLog, Long> {
    List<CampaignActivityLog> findByCampaignIdOrderByCreatedAtAsc(Long campaignId);
}

