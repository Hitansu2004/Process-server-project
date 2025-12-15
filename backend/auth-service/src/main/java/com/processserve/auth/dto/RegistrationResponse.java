package com.processserve.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RegistrationResponse {
    private boolean success;
    private String message;
    private String userId;
}
