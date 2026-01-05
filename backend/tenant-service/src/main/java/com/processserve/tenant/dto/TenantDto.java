package com.processserve.tenant.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TenantDto {
    private String id;
    private String name;
    private String domainUrl;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private String subscriptionTier;
}
