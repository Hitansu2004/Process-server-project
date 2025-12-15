package com.processserve.user.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "process_server_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProcessServerProfile {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "tenant_user_role_id", length = 36, unique = true, nullable = false)
    private String tenantUserRoleId;

    @Column(name = "tenant_id", length = 36)
    private String tenantId;

    @Column(name = "is_global")
    private Boolean isGlobal = false;

    @Column(name = "operating_zip_codes", columnDefinition = "JSON")
    private String operatingZipCodes; // Stored as JSON array

    @Column(name = "current_rating", precision = 3, scale = 2)
    private BigDecimal currentRating = BigDecimal.ZERO;

    @Column(name = "total_orders_assigned")
    private Integer totalOrdersAssigned = 0;

    @Column(name = "successful_deliveries")
    private Integer successfulDeliveries = 0;

    @Column(name = "failed_after_max_attempts")
    private Integer failedAfterMaxAttempts = 0;

    @Column(name = "total_attempts")
    private Integer totalAttempts = 0;

    @Column(name = "average_attempts_per_delivery", precision = 4, scale = 2)
    private BigDecimal averageAttemptsPerDelivery = BigDecimal.ZERO;

    @Column(name = "is_red_zone")
    private Boolean isRedZone = false;

    @Column(name = "red_zone_trigger_count")
    private Integer redZoneTriggerCount = 0;

    @Column(name = "verification_docs", columnDefinition = "JSON")
    private String verificationDocs;

    @Column(name = "profile_photo_url", length = 500)
    private String profilePhotoUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProcessServerStatus status;

    @Column(name = "last_delivery_at")
    private LocalDateTime lastDeliveryAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum ProcessServerStatus {
        PENDING_APPROVAL, ACTIVE, SUSPENDED, BANNED
    }
}
