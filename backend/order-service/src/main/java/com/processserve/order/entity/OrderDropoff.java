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
@Table(name = "order_dropoffs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDropoff {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonBackReference("order-dropoffs")
    private Order order;

    @Column(name = "sequence_number", nullable = false)
    private Integer sequenceNumber;

    @Column(name = "recipient_name", nullable = false)
    private String recipientName;

    @Column(name = "dropoff_address", columnDefinition = "TEXT", nullable = false)
    private String dropoffAddress;

    @Column(name = "dropoff_zip_code", length = 10, nullable = false)
    private String dropoffZipCode;

    @Column(name = "assigned_process_server_id", length = 36)
    private String assignedProcessServerId;

    @Column(name = "final_agreed_price", precision = 10, scale = 2)
    private BigDecimal finalAgreedPrice;

    @Column(name = "rush_service")
    private Boolean rushService = false;

    @Column(name = "remote_location")
    private Boolean remoteLocation = false;

    @Column(name = "base_price", precision = 10, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "rush_service_fee", precision = 10, scale = 2)
    private BigDecimal rushServiceFee;

    @Column(name = "remote_location_fee", precision = 10, scale = 2)
    private BigDecimal remoteLocationFee;

    @Enumerated(EnumType.STRING)
    @Column(name = "dropoff_type")
    private DropoffType dropoffType = DropoffType.AUTOMATED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DropoffStatus status;

    @Column(name = "attempt_count")
    private Integer attemptCount = 0;

    @Column(name = "max_attempts")
    private Integer maxAttempts = 5;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "dropoff", cascade = CascadeType.ALL)
    @JsonManagedReference("dropoff-attempts")
    private List<ProcessServerAttempt> attempts = new ArrayList<>();

    public enum DropoffStatus {
        OPEN, PENDING, BIDDING, ASSIGNED, IN_PROGRESS, DELIVERED, FAILED
    }

    public enum DropoffType {
        GUIDED, AUTOMATED
    }

    public enum ServiceType {
        PROCESS_SERVICE, CERTIFIED_MAIL
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "service_type")
    private ServiceType serviceType = ServiceType.PROCESS_SERVICE;
}
