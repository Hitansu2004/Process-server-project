package com.processserve.order.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * OrderDraft - Separate entity for order drafts
 * Design: Like major apps (Gmail drafts, LinkedIn job posts, etc.)
 * - Auto-saves user progress
 * - Multiple drafts per user
 * - Expires after 7 days of inactivity
 * - Stores data as JSON for flexibility
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

    @Column(name = "tenant_id", length = 36, nullable = false)
    private String tenantId;

    @Column(name = "customer_id", length = 36, nullable = false)
    private String customerId;

    @Column(name = "draft_name", length = 255)
    private String draftName;

    @Column(name = "current_step")
    private Integer currentStep = 1; // 1-5 for wizard steps

    @Column(name = "is_complete")
    private Boolean isComplete = false; // Ready to submit?

    @Column(name = "document_data", columnDefinition = "JSON")
    private String documentData; // Step 1: Document details

    @Column(name = "recipients_data", columnDefinition = "JSON")
    private String recipientsData; // Step 2: Recipients

    @Column(name = "service_options_data", columnDefinition = "JSON")
    private String serviceOptionsData; // Step 3: Service options

    @Column(name = "documents_data", columnDefinition = "TEXT")
    private String documentsData; // Uploaded document URLs and metadata

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt; // Auto-delete after 7 days

    @PrePersist
    @PreUpdate
    public void updateTimestamps() {
        this.updatedAt = LocalDateTime.now();
        // Set expiration to 7 days from now
        this.expiresAt = LocalDateTime.now().plusDays(7);
    }
}
