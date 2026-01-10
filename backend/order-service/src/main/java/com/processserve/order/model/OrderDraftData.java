package com.processserve.order.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Entity representing the actual content of a draft order.
 * Stores all draft data as flexible JSON - no validation required!
 */
@Entity
@Table(name = "order_draft_data")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDraftData {

    @Id
    @Column(length = 36)
    private String id;

    @OneToOne
    @JoinColumn(name = "draft_id", nullable = false, unique = true)
    private OrderDraft draft;

    @Type(JsonType.class)
    @Column(name = "document_data", columnDefinition = "json")
    private Map<String, Object> documentData;

    @Type(JsonType.class)
    @Column(name = "recipients_data", columnDefinition = "json")
    private Map<String, Object> recipientsData;

    @Type(JsonType.class)
    @Column(name = "service_options_data", columnDefinition = "json")
    private Map<String, Object> serviceOptionsData;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
