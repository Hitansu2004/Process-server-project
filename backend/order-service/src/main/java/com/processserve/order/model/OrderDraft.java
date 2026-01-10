package com.processserve.order.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Entity representing a draft order in progress.
 * Stores metadata about the draft (customer, step, timestamps).
 * Actual draft content is stored in OrderDraftData as JSON.
 */
@Entity
@Table(name = "order_drafts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDraft {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "customer_id", nullable = false, length = 36)
    private String customerId;

    @Column(name = "tenant_id", nullable = false, length = 36)
    private String tenantId;

    @Column(name = "draft_name", length = 255)
    private String draftName = "Untitled Draft";

    @Column(name = "current_step")
    private Integer currentStep = 1;

    @Column(name = "is_complete")
    private Boolean isComplete = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @OneToOne(mappedBy = "draft", cascade = CascadeType.ALL, orphanRemoval = true)
    private OrderDraftData draftData;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
        // Set expiration to 30 days from creation
        if (expiresAt == null) {
            expiresAt = LocalDateTime.now().plusDays(30);
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
