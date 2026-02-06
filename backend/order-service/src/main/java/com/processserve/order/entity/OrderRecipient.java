package com.processserve.order.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "order_recipients")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderRecipient {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonBackReference("order-recipients")
    private Order order;

    @Column(name = "sequence_number", nullable = false)
    private Integer sequenceNumber;

    @Column(name = "recipient_order_number", length = 100)
    private String recipientOrderNumber; // e.g., ORD-2026-039-01, ORD-2026-039-02

    // Recipient Entity Type (Individual or Organization)
    @Enumerated(EnumType.STRING)
    @Column(name = "recipient_entity_type")
    private RecipientEntityType recipientEntityType = RecipientEntityType.INDIVIDUAL;

    // Individual recipient fields
    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "middle_name", length = 100)
    private String middleName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    // Organization recipient fields
    @Column(name = "organization_name", length = 255)
    private String organizationName;

    @Column(name = "authorized_agent", length = 255)
    private String authorizedAgent;

    // Contact information
    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "phone", length = 20)
    private String phone;

    // Legacy field for backward compatibility
    @Column(name = "recipient_name", nullable = false)
    private String recipientName;

    @Column(name = "recipient_address", columnDefinition = "TEXT", nullable = false)
    private String recipientAddress;

    @Column(name = "recipient_zip_code", length = 10, nullable = false)
    private String recipientZipCode;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "state_id", length = 50)
    private String stateId;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "special_instructions", columnDefinition = "TEXT")
    private String specialInstructions;

    @Column(name = "assigned_process_server_id", length = 36)
    private String assignedProcessServerId;

    @Column(name = "process_server_name", length = 200)
    private String processServerName;

    @Column(name = "process_service")
    private Boolean processService = false;

    @Column(name = "certified_mail")
    private Boolean certifiedMail = false;

    @Column(name = "rush_service")
    private Boolean rushService = false;

    @Column(name = "remote_location")
    private Boolean remoteLocation = false;

    @Column(name = "service_options_fee", precision = 10, scale = 2)
    private BigDecimal serviceOptionsFee = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "recipient_type")
    private RecipientType recipientType = RecipientType.AUTOMATED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecipientStatus status;

    @Column(name = "attempt_count")
    private Integer attemptCount = 0;

    @Column(name = "max_attempts")
    private Integer maxAttempts = 5;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "recipient", cascade = CascadeType.ALL)
    @JsonManagedReference("recipient-attempts")
    private List<ProcessServerAttempt> attempts = new ArrayList<>();

    // REMOVED PRICING: negotiations field, negotiationStatus, activeNegotiationId, lastNegotiationAt

    public enum RecipientStatus {
        OPEN, PENDING, BIDDING, ASSIGNED, IN_PROGRESS, DELIVERED, FAILED
    }

    public enum RecipientType {
        GUIDED, AUTOMATED
    }

    public enum RecipientEntityType {
        INDIVIDUAL, ORGANIZATION
    }

    public enum ServiceType {
        PROCESS_SERVICE, CERTIFIED_MAIL
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "service_type")
    private ServiceType serviceType = ServiceType.PROCESS_SERVICE;

    // New fields for independent recipient editing
    @Column(name = "document_url", length = 500)
    private String documentUrl; // Document specific to this recipient

    @Column(name = "uses_order_document")
    private Boolean usesOrderDocument = true; // If true, uses order's document; if false, uses own document

    @Column(name = "can_edit")
    private Boolean canEdit = true; // Determines if this recipient can be edited

    @Column(name = "last_edited_at")
    private LocalDateTime lastEditedAt;

    @Column(name = "last_edited_by", length = 100)
    private String lastEditedBy;

    // Pricing fields for recipients
    @Column(name = "base_price", precision = 10, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "final_agreed_price", precision = 10, scale = 2)
    private BigDecimal finalAgreedPrice;

    @Column(name = "remote_location_fee", precision = 10, scale = 2)
    private BigDecimal remoteLocationFee;

    @Column(name = "rush_service_fee", precision = 10, scale = 2)
    private BigDecimal rushServiceFee;
}

