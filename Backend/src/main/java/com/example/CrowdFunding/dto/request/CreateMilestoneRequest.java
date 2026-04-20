package com.example.CrowdFunding.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateMilestoneRequest {
    @NotNull
    private Long campaignId;

    @NotNull
    @Min(1)
    @Max(10)
    private Integer sequenceNumber;

    @NotBlank
    @Size(max = 200)
    private String title;

    @NotBlank
    @Size(max = 2000)
    private String description;

    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal amountToRelease;

    @NotNull
    private LocalDate dueDate;
}

