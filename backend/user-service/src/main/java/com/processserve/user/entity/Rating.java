package com.processserve.user.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ratings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Rating {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "order_id", length = 36, unique = true, nullable = false)
    private String orderId;

    @Column(name = "customer_id", length = 36, nullable = false)
    private String customerId;

    @Column(name = "process_server_id", length = 36, nullable = false)
    private String processServerId;

    @Column(name = "rating", nullable = false)
    private Integer ratingValue; // 1-5 stars

    @Column(name = "feedback", columnDefinition = "TEXT")
    private String reviewText;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
