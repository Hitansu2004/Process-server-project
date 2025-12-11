package com.processserve.user.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tenant_user_roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TenantUserRole {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "global_user_id", nullable = false)
    private GlobalUser globalUser;

    @Column(name = "tenant_id", length = 36, nullable = false)
    private String tenantId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum UserRole {
        TENANT_ADMIN,
        CUSTOMER,
        PROCESS_SERVER
    }
}
