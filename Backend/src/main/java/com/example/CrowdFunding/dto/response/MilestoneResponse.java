package com.example.CrowdFunding.dto.response;

import com.example.CrowdFunding.enums.MilestoneStatus;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MilestoneResponse {
    private Long id;
    private Long campaignId;
    private Integer sequenceNumber;
    private String title;
    private String description;
    private BigDecimal amountToRelease;
    private MilestoneStatus status;
}

