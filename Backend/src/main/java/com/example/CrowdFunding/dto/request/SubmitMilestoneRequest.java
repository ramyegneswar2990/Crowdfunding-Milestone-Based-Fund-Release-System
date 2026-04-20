package com.example.CrowdFunding.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmitMilestoneRequest {
    @NotBlank
    @Size(min = 8, max = 8)
    @Pattern(regexp = "^[0-9]{8}$", message = "Bill reference must be exactly 8 digits")
    private String billReference;
}

