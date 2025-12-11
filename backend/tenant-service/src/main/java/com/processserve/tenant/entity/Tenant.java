package com.processserve.tenant.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tenants")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Tenant {

    @Id
    @Column(length = 36)
    private String id;

    @Column(unique = true, nullable = false)
    private String name;

    @Column(name = "domain_url", unique = true)
    private String domainUrl;

    @Column(name = "api_key", unique = true, length = 64)
    private String apiKey;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "business_hours", columnDefinition = "JSON")
    private String businessHours;

    @Column(name = "pricing_config", columnDefinition = "JSON")
    private String pricingConfig;

    @Column(name = "notification_settings", columnDefinition = "JSON")
    private String notificationSettings;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "subscription_tier")
    private String subscriptionTier;
}
