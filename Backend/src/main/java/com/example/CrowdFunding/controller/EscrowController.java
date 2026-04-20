package com.example.CrowdFunding.controller;

import com.example.CrowdFunding.dto.response.ApiResponse;
import com.example.CrowdFunding.dto.response.EscrowResponse;
import com.example.CrowdFunding.dto.response.TransactionResponse;
import com.example.CrowdFunding.service.EscrowService;
import com.example.CrowdFunding.service.FundReleaseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Tag(name = "Escrow & Fund Release", description = "Escrow balance and milestone fund release (ADMIN only)")
public class EscrowController {

    private final EscrowService escrowService;
    private final FundReleaseService fundReleaseService;

    public EscrowController(EscrowService escrowService, FundReleaseService fundReleaseService) {
        this.escrowService = escrowService;
        this.fundReleaseService = fundReleaseService;
    }

    @GetMapping("/api/escrow/campaign/{campaignId}")
    @Operation(summary = "Get escrow balance for a campaign (ADMIN only)")
    public ResponseEntity<ApiResponse<EscrowResponse>> getEscrow(@PathVariable Long campaignId) {
        return ResponseEntity.ok(ApiResponse.ok("Escrow fetched",
                escrowService.getEscrow(campaignId)));
    }

    @PostMapping("/api/releases/milestone/{milestoneId}")
    @Operation(summary = "Release funds for a VERIFIED milestone (ADMIN only)")
    public ResponseEntity<ApiResponse<TransactionResponse>> releaseFunds(
            @PathVariable Long milestoneId,
            @AuthenticationPrincipal UserDetails principal) {
        TransactionResponse res = fundReleaseService.releaseFunds(milestoneId, principal.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Funds released successfully", res));
    }

    @GetMapping("/api/transactions/campaign/{campaignId}")
    @Operation(summary = "Get fund release transaction history for a campaign (ADMIN only)")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getTransactions(
            @PathVariable Long campaignId) {
        return ResponseEntity.ok(ApiResponse.ok("Transactions fetched",
                fundReleaseService.getTransactionsByCampaign(campaignId)));
    }
}
