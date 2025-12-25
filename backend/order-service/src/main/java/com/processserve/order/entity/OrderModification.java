package com.processserve.order.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "order_modifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderModification {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "order_id", length = 36, nullable = false)
    private String orderId;

    @Column(name = "modified_by_user_id", length = 36, nullable = false)
    private String modifiedByUserId;

    @Enumerated(EnumType.STRING)
    @Column(name = "modification_type", nullable = false, length = 30)
    private ModificationType modificationType;

    @Column(name = "old_values", columnDefinition = "JSON")
    private String oldValues;

    @Column(name = "new_values", columnDefinition = "JSON")
    private String newValues;

    @Column(name = "modification_reason", columnDefinition = "TEXT")
    private String modificationReason;

    @CreationTimestamp
    @Column(name = "modified_at", updatable = false)
    private LocalDateTime modifiedAt;

    public enum ModificationType {
        UPDATE_DETAILS,
        CANCEL,
        ADD_DROPOFF,
        REMOVE_DROPOFF,
        MODIFY_DROPOFF,
        UPDATE_DEADLINE,
        UPDATE_INSTRUCTIONS
    }
}
