package com.processserve.auth.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class GoogleAuthRequest {
    @NotBlank(message = "Google ID token is required")
    private String idToken;
    
    private String tenantId; // Optional, for tenant-specific registration
    private String role; // Optional: ADMIN, CUSTOMER, PROCESS_SERVER
}
