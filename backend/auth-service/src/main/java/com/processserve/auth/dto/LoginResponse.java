package com.processserve.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {

    private String token;
    private String userId;
    private String email;
    private String firstName;
    private String lastName;
    private Boolean isSuperAdmin;
    private Boolean emailVerified;
    private List<java.util.Map<String, String>> roles;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserRoleDTO {
        private String id; // tenantUserRoleId
        private String tenantId;
        private String role;
    }
}
