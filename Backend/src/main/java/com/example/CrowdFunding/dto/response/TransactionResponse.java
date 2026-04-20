package com.example.CrowdFunding.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionResponse {
    private Long id;
    private Long campaignId;
    private Long milestoneId;
    private BigDecimal amountReleased;
    private Instant releasedAt;
}

