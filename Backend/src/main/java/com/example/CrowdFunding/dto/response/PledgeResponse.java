package com.example.CrowdFunding.dto.response;

import com.example.CrowdFunding.enums.PledgeStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PledgeResponse {
    private Long id;
    private Long campaignId;
    private Long backerId;
    private BigDecimal amount;
    private PledgeStatus status;
    private Instant createdAt;
}

