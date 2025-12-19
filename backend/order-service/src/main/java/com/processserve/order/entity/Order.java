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
    @Column(nullable = false, length = 50)
    private OrderStatus status;

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

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("order-dropoffs")
    private List<OrderDropoff> dropoffs = new ArrayList<>();

    @Transient
    private String customerName;

    public enum OrderStatus {
        DRAFT, OPEN, BIDDING, PARTIALLY_ASSIGNED, ASSIGNED, IN_PROGRESS, COMPLETED, FAILED, CANCELLED
    }
}
