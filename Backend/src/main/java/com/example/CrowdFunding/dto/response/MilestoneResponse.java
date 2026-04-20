package com.example.CrowdFunding.dto.response;

import com.example.CrowdFunding.enums.MilestoneStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
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
    private LocalDate dueDate;
    private MilestoneStatus status;
    private String rejectionReason;
    private String billReference;
}

