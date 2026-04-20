package com.example.CrowdFunding.controller;

import com.example.CrowdFunding.dto.request.CreateMilestoneRequest;
import com.example.CrowdFunding.dto.request.RejectMilestoneRequest;
import com.example.CrowdFunding.dto.request.SubmitMilestoneRequest;
import com.example.CrowdFunding.dto.response.ApiResponse;
import com.example.CrowdFunding.dto.response.MilestoneResponse;
import com.example.CrowdFunding.service.MilestoneService;
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
@RequestMapping("/api/milestones")
@Tag(name = "Milestones", description = "Milestone lifecycle and verification")
public class MilestoneController {

    private final MilestoneService milestoneService;

    public MilestoneController(MilestoneService milestoneService) {
        this.milestoneService = milestoneService;
    }

    @PostMapping
    @Operation(summary = "Create milestone for a campaign (CAMPAIGNER, max 10)")
    public ResponseEntity<ApiResponse<MilestoneResponse>> create(
            @Valid @RequestBody CreateMilestoneRequest req,
            @AuthenticationPrincipal UserDetails principal) {
        MilestoneResponse res = milestoneService.createMilestone(req, principal.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Milestone created", res));
    }

    @PutMapping("/{id}/submit")
    @Operation(summary = "Submit milestone completion with bill reference (CAMPAIGNER only)")
    public ResponseEntity<ApiResponse<MilestoneResponse>> submit(
            @PathVariable Long id,
            @Valid @RequestBody SubmitMilestoneRequest req,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.ok("Milestone submitted for verification",
                milestoneService.submitMilestone(id, req.getBillReference(), principal.getUsername())));
    }

    @PutMapping("/{id}/verify")
    @Operation(summary = "Verify milestone (VERIFIER only)")
    public ResponseEntity<ApiResponse<MilestoneResponse>> verify(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.ok("Milestone verified",
                milestoneService.verifyMilestone(id, principal.getUsername())));
    }

    @PutMapping("/{id}/reject")
    @Operation(summary = "Reject milestone (VERIFIER only)")
    public ResponseEntity<ApiResponse<MilestoneResponse>> reject(
            @PathVariable Long id,
            @Valid @RequestBody RejectMilestoneRequest req,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.ok("Milestone rejected",
                milestoneService.rejectMilestone(id, req.getReason(), principal.getUsername())));
    }

    @GetMapping("/campaign/{campaignId}")
    @Operation(summary = "Get milestones for a campaign ordered by sequence")
    public ResponseEntity<ApiResponse<List<MilestoneResponse>>> getByCampaign(
            @PathVariable Long campaignId) {
        return ResponseEntity.ok(ApiResponse.ok("Milestones fetched",
                milestoneService.getByCampaign(campaignId)));
    }
}
