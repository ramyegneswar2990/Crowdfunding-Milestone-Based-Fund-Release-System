package com.example.CrowdFunding.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "campaign_activity_logs", indexes = {
        @Index(name = "idx_cal_campaign_id", columnList = "campaign_id"),
        @Index(name = "idx_cal_created_at", columnList = "createdAt")
})
public class CampaignActivityLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Campaign campaign;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_user_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User actor;

    @Column(nullable = false, length = 80)
    private String action;

    @Column(nullable = false, length = 2000)
    private String details;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
    }
}

