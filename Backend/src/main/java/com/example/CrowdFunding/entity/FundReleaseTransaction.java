package com.example.CrowdFunding.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "fund_release_transactions", indexes = {
        @Index(name = "idx_frt_campaign_id", columnList = "campaign_id"),
        @Index(name = "idx_frt_milestone_id", columnList = "milestone_id")
})
public class FundReleaseTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Campaign campaign;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "milestone_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Milestone milestone;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amountReleased;

    @Column(nullable = false, updatable = false)
    private Instant releasedAt;

    @PrePersist
    void prePersist() {
        if (releasedAt == null) releasedAt = Instant.now();
    }
}

