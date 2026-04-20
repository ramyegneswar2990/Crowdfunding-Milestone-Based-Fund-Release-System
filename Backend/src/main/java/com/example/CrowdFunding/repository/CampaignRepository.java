package com.example.CrowdFunding.repository;

import com.example.CrowdFunding.entity.Campaign;
import com.example.CrowdFunding.enums.CampaignStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CampaignRepository extends JpaRepository<Campaign, Long> {
    List<Campaign> findByStatus(CampaignStatus status);

    List<Campaign> findByStatusIn(List<CampaignStatus> statuses);
}

