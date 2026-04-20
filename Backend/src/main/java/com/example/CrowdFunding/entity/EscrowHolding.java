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
@Table(name = "escrow_holdings", uniqueConstraints = {
        @UniqueConstraint(name = "uk_escrow_campaign", columnNames = {"campaign_id"})
})
public class EscrowHolding {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Campaign campaign;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal totalHeld;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal totalReleased;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal remaining;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
        if (totalHeld == null) totalHeld = BigDecimal.ZERO;
        if (totalReleased == null) totalReleased = BigDecimal.ZERO;
        if (remaining == null) remaining = BigDecimal.ZERO;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}

