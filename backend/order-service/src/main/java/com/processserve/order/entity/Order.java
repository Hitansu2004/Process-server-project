package com.processserve.order.entity;

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
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "tenant_id", length = 36, nullable = false)
    private String tenantId;

    @Column(name = "customer_id", length = 36, nullable = false)
    private String customerId;

    // assigned_delivery_person_id removed - moved to OrderDropoff

    @Column(name = "order_number", unique = true, nullable = false, length = 50)
    private String orderNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_type", length = 20)
    private OrderType orderType = OrderType.PROCESS_SERVICE;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", length = 30)
    private DocumentType documentType;

    @Column(name = "other_document_type", length = 255)
    private String otherDocumentType;

    @Column(name = "case_number", length = 100)
    private String caseNumber;

    @Column(name = "jurisdiction", length = 255)
    private String jurisdiction;

    @Column(name = "document_url", length = 512)
    private String documentUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private OrderStatus status;

    @Column(name = "is_editable")
    private Boolean isEditable = true;

    @Column(name = "special_instructions", columnDefinition = "TEXT")
    private String specialInstructions;

    @Column(nullable = false)
    private LocalDateTime deadline;

    @Column(name = "final_agreed_price", precision = 10, scale = 2)
    private BigDecimal finalAgreedPrice;

    // Payment Breakdown Fields for Commission Distribution
    @Column(name = "customer_payment_amount", precision = 10, scale = 2)
    private BigDecimal customerPaymentAmount;

    @Column(name = "process_server_payout", precision = 10, scale = 2)
    private BigDecimal processServerPayout;

    @Column(name = "tenant_commission", precision = 10, scale = 2)
    private BigDecimal tenantCommission;

    @Column(name = "super_admin_fee", precision = 10, scale = 2)
    private BigDecimal superAdminFee;

    @Column(name = "tenant_profit", precision = 10, scale = 2)
    private BigDecimal tenantProfit;

    @Column(name = "pricing_config", columnDefinition = "JSON")
    private String pricingConfig;

    @Column(name = "commission_rate_applied", precision = 5, scale = 2)
    private BigDecimal commissionRateApplied;

    @Column(name = "has_multiple_dropoffs")
    private Boolean hasMultipleDropoffs = false;

    @Column(name = "total_dropoffs")
    private Integer totalDropoffs = 1;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "last_modified_at")
    private LocalDateTime lastModifiedAt;

    @Column(name = "modification_count")
    private Integer modificationCount = 0;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("order-dropoffs")
    private List<OrderDropoff> dropoffs = new ArrayList<>();

    @Transient
    private String customerName;

    public enum OrderStatus {
        DRAFT, OPEN, BIDDING, PARTIALLY_ASSIGNED, ASSIGNED, IN_PROGRESS, COMPLETED, FAILED, CANCELLED
    }

    public enum OrderType {
        PROCESS_SERVICE, CERTIFIED_MAIL
    }

    public enum DocumentType {
        CRIMINAL_CASE,
        CIVIL_COMPLAINT,
        RESTRAINING_ORDER,
        HOUSE_ARREST,
        EVICTION_NOTICE,
        SUBPOENA,
        DIVORCE_PAPERS,
        CHILD_CUSTODY,
        SMALL_CLAIMS,
        BANKRUPTCY,
        OTHER
    }

    // Requirement 8: Check if order can be edited based on status
    // Only DRAFT, OPEN, and BIDDING statuses allow editing
    // ASSIGNED, IN_PROGRESS, COMPLETED, FAILED, CANCELLED are locked
    public boolean canBeEdited() {
        return this.status == OrderStatus.DRAFT ||
                this.status == OrderStatus.OPEN ||
                this.status == OrderStatus.BIDDING;
    }

    // Helper method to increment modification count
    public void incrementModificationCount() {
        if (this.modificationCount == null) {
            this.modificationCount = 0;
        }
        this.modificationCount++;
        this.lastModifiedAt = LocalDateTime.now();
    }
}
