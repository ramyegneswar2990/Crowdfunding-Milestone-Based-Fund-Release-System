package com.example.CrowdFunding.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CampaignLifecycleService {

    private final CampaignService campaignService;

    public CampaignLifecycleService(CampaignService campaignService) {
        this.campaignService = campaignService;
    }

    @Scheduled(cron = "0 */30 * * * *")
    @Transactional
    public void evaluateExpiredCampaigns() {
        campaignService.evaluateExpiredCampaigns();
    }
}
