package com.example.CrowdFunding.controller;

import com.example.CrowdFunding.dto.request.CreatePledgeRequest;
import com.example.CrowdFunding.dto.response.ApiResponse;
import com.example.CrowdFunding.dto.response.PledgeResponse;
import com.example.CrowdFunding.service.PledgeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pledges")
@Tag(name = "Pledges", description = "Backer pledge management")
public class PledgeController {

    private final PledgeService pledgeService;

    public PledgeController(PledgeService pledgeService) {
        this.pledgeService = pledgeService;
    }

    @PostMapping
    @Operation(summary = "Create a pledge (BACKER only, min ₹500)")
    public ResponseEntity<ApiResponse<PledgeResponse>> create(
            @Valid @RequestBody CreatePledgeRequest req,
            @AuthenticationPrincipal UserDetails principal) {
        PledgeResponse res = pledgeService.createPledge(req, principal.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Pledge created successfully", res));
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel a pledge (BACKER only, before campaign ends)")
    public ResponseEntity<ApiResponse<PledgeResponse>> cancel(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.ok("Pledge cancelled",
                pledgeService.cancelPledge(id, principal.getUsername())));
    }

    @GetMapping
    @Operation(summary = "Get all pledges (ADMIN only)")
    public ResponseEntity<ApiResponse<List<PledgeResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok("Pledges fetched", pledgeService.getAll()));
    }

    @GetMapping("/campaign/{campaignId}")
    @Operation(summary = "Get pledges for a campaign")
    public ResponseEntity<ApiResponse<List<PledgeResponse>>> getByCampaign(
            @PathVariable Long campaignId) {
        return ResponseEntity.ok(ApiResponse.ok("Campaign pledges fetched",
                pledgeService.getByCampaign(campaignId)));
    }
}
