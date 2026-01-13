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
@Table(name = "price_negotiations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PriceNegotiation {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_recipient_id", nullable = false)
    @JsonBackReference("recipient-negotiations")
    private OrderRecipient recipient;

    @Column(name = "order_recipient_id", insertable = false, updatable = false)
    private String orderRecipientId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Party proposedBy; // PROCESS_SERVER or CUSTOMER

    @Column(name = "proposed_amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal proposedAmount;

    @Column(name = "counter_offer_amount", precision = 10, scale = 2)
    private BigDecimal counterOfferAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "counter_offered_by")
    private Party counterOfferedBy; // Who made the counter-offer

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NegotiationStatus status; // PENDING, ACCEPTED, REJECTED, EXPIRED

    @Column(name = "proposer_notes", columnDefinition = "TEXT")
    private String proposerNotes;

    @Column(name = "responder_notes", columnDefinition = "TEXT")
    private String responderNotes;

    @Column(name = "negotiation_rounds")
    private Integer negotiationRounds = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "proposed_at")
    private LocalDateTime proposedAt;

    @Column(name = "counter_offered_at")
    private LocalDateTime counterOfferedAt;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Party {
        PROCESS_SERVER, CUSTOMER
    }

    public enum NegotiationStatus {
        PENDING, ACCEPTED, REJECTED, EXPIRED
    }
}
