package com.example.CrowdFunding.dto.response;

import com.example.CrowdFunding.enums.CampaignStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampaignResponse {
    private Long id;
    private Long campaignerId;
    private String title;
    private String description;
    private String category;
    private BigDecimal fundingGoal;
    private BigDecimal totalPledged;
    private BigDecimal totalReleased;
    private CampaignStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
}

