package com.processserve.order.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bids")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Bid {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_recipient_id", nullable = false)
    @JsonBackReference("recipient-bids")
    private OrderRecipient recipient;

    @Column(name = "order_recipient_id", insertable = false, updatable = false)
    private String orderRecipientId;

    @Column(name = "process_server_id", length = 36, nullable = false)
    private String processServerId;

    @Column(name = "bid_amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal bidAmount;

    @Column(columnDefinition = "TEXT")
    private String comment;

    // Counter-offer fields for negotiation
    @Column(name = "customer_counter_amount", precision = 10, scale = 2)
    private BigDecimal customerCounterAmount;

    @Column(name = "customer_counter_notes", columnDefinition = "TEXT")
    private String customerCounterNotes;

    @Column(name = "counter_offer_count")
    private Integer counterOfferCount = 0;

    @Column(name = "last_counter_by")
    private String lastCounterBy; // "CUSTOMER" or "PROCESS_SERVER"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BidStatus status;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum BidStatus {
        PENDING, ACCEPTED, REJECTED, WITHDRAWN
    }
}
