package com.processserve.order.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "order_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderHistory {

    @Id
    private String id;

    @Column(name = "order_id", nullable = false)
    private String orderId;

    @Column(name = "recipient_id")
    private String recipientId; // Nullable - null for order-level changes

    @Column(name = "changed_by_user_id", nullable = false)
    private String changedByUserId;

    @Column(name = "changed_by_role", nullable = false, length = 50)
    private String changedByRole; // CUSTOMER, PROCESS_SERVER, ADMIN

    @Column(name = "change_type", nullable = false, length = 50)
    private String changeType; // CREATED, EDITED, STATUS_CHANGED, DOCUMENT_UPLOADED, etc.

    @Column(name = "field_name", length = 100)
    private String fieldName; // What field changed

    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;

    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description; // Human-readable description

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (id == null) {
            id = java.util.UUID.randomUUID().toString();
        }
    }
}
