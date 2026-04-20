package com.example.CrowdFunding.entity;

import com.example.CrowdFunding.enums.PledgeStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "pledges", indexes = {
        @Index(name = "idx_pledges_campaign_id", columnList = "campaign_id"),
        @Index(name = "idx_pledges_backer_id", columnList = "backer_id"),
        @Index(name = "idx_pledges_status", columnList = "status")
})
public class Pledge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Campaign campaign;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "backer_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User backer;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PledgeStatus status;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
        if (status == null) status = PledgeStatus.COMPLETED;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}

