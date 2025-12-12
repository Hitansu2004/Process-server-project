package com.processserve.user.dto;

import lombok.Data;
import lombok.Builder;
import java.time.LocalDateTime;

@Data
@Builder
public class CustomerDTO {
    private String id; // Customer profile ID
    private String globalUserId; // Global user ID
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String tenantId;
    private Integer totalOrders;
    private String companyName; // If exists
    private LocalDateTime createdAt; // When customer joined (from TenantUserRole)
}
