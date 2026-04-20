package com.example.CrowdFunding.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EscrowResponse {
    private Long campaignId;
    private BigDecimal totalHeld;
    private BigDecimal totalReleased;
    private BigDecimal remaining;
}

