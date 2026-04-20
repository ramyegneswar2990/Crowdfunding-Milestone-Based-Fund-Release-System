package com.example.CrowdFunding.entity;

import com.example.CrowdFunding.enums.CampaignStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "campaigns", indexes = {
        @Index(name = "idx_campaigns_status", columnList = "status"),
        @Index(name = "idx_campaigns_campaigner_id", columnList = "campaigner_id")
})
public class Campaign {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "campaigner_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User campaigner;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal fundingGoal;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal totalPledged;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal totalReleased;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CampaignStatus status;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
        if (status == null) status = CampaignStatus.DRAFT;
        if (totalPledged == null) totalPledged = BigDecimal.ZERO;
        if (totalReleased == null) totalReleased = BigDecimal.ZERO;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}

