package com.example.CrowdFunding.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatePledgeRequest {
    @NotNull
    private Long campaignId;

    @NotNull
    @DecimalMin(value = "500.00")
    private BigDecimal amount;
}

