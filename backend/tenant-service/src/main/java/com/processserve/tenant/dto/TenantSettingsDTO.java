package com.processserve.tenant.dto;

import lombok.Data;

@Data
public class TenantSettingsDTO {
    private String businessHours;
    private String pricingConfig;
    private String notificationSettings;
}
