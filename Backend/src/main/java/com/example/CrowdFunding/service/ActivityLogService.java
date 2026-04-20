package com.example.CrowdFunding.service;

import com.example.CrowdFunding.entity.Campaign;
import com.example.CrowdFunding.entity.CampaignActivityLog;
import com.example.CrowdFunding.entity.User;
import com.example.CrowdFunding.repository.CampaignActivityLogRepository;
import org.springframework.stereotype.Service;

@Service
public class ActivityLogService {

    private final CampaignActivityLogRepository logRepository;

    public ActivityLogService(CampaignActivityLogRepository logRepository) {
        this.logRepository = logRepository;
    }

    public void log(Campaign campaign, User actor, String action, String details) {
        CampaignActivityLog entry = CampaignActivityLog.builder()
                .campaign(campaign)
                .actor(actor)
                .action(action)
                .details(details)
                .build();
        logRepository.save(entry);
    }
}
