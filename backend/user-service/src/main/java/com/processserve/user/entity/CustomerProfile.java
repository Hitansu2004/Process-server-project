package com.processserve.user.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "customer_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerProfile {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "tenant_user_role_id", length = 36, unique = true, nullable = false)
    private String tenantUserRoleId;
}
