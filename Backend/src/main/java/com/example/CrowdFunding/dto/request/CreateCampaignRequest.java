package com.example.CrowdFunding.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCampaignRequest {
    @NotBlank
    @Size(max = 200)
    private String title;

    @NotBlank
    @Size(max = 2000)
    private String description;

    @NotNull
    @DecimalMin(value = "50000.00")
    @DecimalMax(value = "5000000.00")
    private BigDecimal fundingGoal;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;
}

