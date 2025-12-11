package com.processserve.order.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_attempts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProcessServerAttempt {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_dropoff_id", nullable = false)
    @JsonBackReference("dropoff-attempts")
    private OrderDropoff dropoff;

    @Column(name = "process_server_id", length = 36, nullable = false)
    private String processServerId;

    @Column(name = "attempt_number", nullable = false)
    private Integer attemptNumber;

    @CreationTimestamp
    @Column(name = "attempt_time", updatable = false)
    private LocalDateTime attemptTime;

    @Column(name = "was_successful")
    private Boolean wasSuccessful = false;

    @Column(name = "outcome_notes", columnDefinition = "TEXT")
    private String outcomeNotes;

    @Column(name = "gps_latitude", precision = 10, scale = 8)
    private BigDecimal gpsLatitude;

    @Column(name = "gps_longitude", precision = 11, scale = 8)
    private BigDecimal gpsLongitude;

    @Column(name = "photo_proof_url", length = 500)
    private String photoProofUrl;

    @Column(name = "is_valid_attempt")
    private Boolean isValidAttempt = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
