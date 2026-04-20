package com.example.CrowdFunding.controller;

import com.example.CrowdFunding.dto.request.CreateCampaignRequest;
import com.example.CrowdFunding.dto.response.ApiResponse;
import com.example.CrowdFunding.dto.response.CampaignResponse;
import com.example.CrowdFunding.service.CampaignService;
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
@RequestMapping("/api/campaigns")
@Tag(name = "Campaigns", description = "Campaign lifecycle management")
public class CampaignController {

    private final CampaignService campaignService;

    public CampaignController(CampaignService campaignService) {
        this.campaignService = campaignService;
    }

    @PostMapping
    @Operation(summary = "Create campaign (CAMPAIGNER only)")
    public ResponseEntity<ApiResponse<CampaignResponse>> create(
            @Valid @RequestBody CreateCampaignRequest req,
            @AuthenticationPrincipal UserDetails principal) {
        CampaignResponse res = campaignService.createCampaign(req, principal.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Campaign created successfully", res));
    }

    @PutMapping("/{id}/submit")
    @Operation(summary = "Submit campaign for approval (CAMPAIGNER only)")
    public ResponseEntity<ApiResponse<CampaignResponse>> submit(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.ok("Campaign submitted for approval",
                campaignService.submitForApproval(id, principal.getUsername())));
    }

    @PutMapping("/{id}/approve")
    @Operation(summary = "Approve campaign (ADMIN only)")
    public ResponseEntity<ApiResponse<CampaignResponse>> approve(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.ok("Campaign approved",
                campaignService.approveCampaign(id, principal.getUsername())));
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel campaign (ADMIN or owner)")
    public ResponseEntity<ApiResponse<CampaignResponse>> cancel(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.ok("Campaign cancelled",
                campaignService.cancelCampaign(id, principal.getUsername())));
    }

    @GetMapping
    @Operation(summary = "Get all campaigns")
    public ResponseEntity<ApiResponse<List<CampaignResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok("Campaigns fetched", campaignService.getAll()));
    }

    @GetMapping("/active")
    @Operation(summary = "Get ACTIVE campaigns (public)")
    public ResponseEntity<ApiResponse<List<CampaignResponse>>> getActive() {
        return ResponseEntity.ok(ApiResponse.ok("Active campaigns fetched", campaignService.getActive()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get campaign by ID")
    public ResponseEntity<ApiResponse<CampaignResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Campaign fetched", campaignService.getById(id)));
    }
}
