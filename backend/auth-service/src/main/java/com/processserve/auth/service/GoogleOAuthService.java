package com.processserve.auth.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.processserve.auth.dto.GoogleAuthRequest;
import com.processserve.auth.dto.LoginResponse;
import com.processserve.auth.entity.GlobalUser;
import com.processserve.auth.entity.TenantUserRole;
import com.processserve.auth.repository.GlobalUserRepository;
import com.processserve.auth.repository.TenantUserRoleRepository;
import com.processserve.auth.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleOAuthService {

    private final GlobalUserRepository globalUserRepository;
    private final TenantUserRoleRepository tenantUserRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;

    @Transactional
    public LoginResponse authenticateWithGoogle(GoogleAuthRequest request) throws Exception {
        // Verify Google ID token
        GoogleIdToken.Payload payload = verifyGoogleToken(request.getIdToken());
        
        if (payload == null) {
            throw new RuntimeException("Invalid Google ID token");
        }

        String email = payload.getEmail();
        String firstName = (String) payload.get("given_name");
        String lastName = (String) payload.get("family_name");
        String googleId = payload.getSubject();
        
        log.info("Google OAuth login attempt for email: {}", email);

        // Check if user exists
        Optional<GlobalUser> existingUser = globalUserRepository.findByEmail(email);
        
        GlobalUser user;
        if (existingUser.isPresent()) {
            user = existingUser.get();
            log.info("Existing user found: {}", email);
        } else {
            // Create new user
            user = new GlobalUser();
            user.setEmail(email);
            user.setFirstName(firstName != null ? firstName : "");
            user.setLastName(lastName != null ? lastName : "");
            user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString())); // Random password for OAuth users
            user.setIsSuperAdmin(false);
            user.setGoogleId(googleId);
            user = globalUserRepository.save(user);
            log.info("New user created via Google OAuth: {}", email);

            // If tenantId and role provided, create tenant role
            if (request.getTenantId() != null && request.getRole() != null) {
                TenantUserRole role = new TenantUserRole();
                role.setGlobalUser(user);
                role.setTenantId(request.getTenantId());
                
                // Convert string role to enum
                TenantUserRole.UserRole userRole;
                switch (request.getRole().toUpperCase()) {
                    case "ADMIN":
                        userRole = TenantUserRole.UserRole.TENANT_ADMIN;
                        break;
                    case "CUSTOMER":
                        userRole = TenantUserRole.UserRole.CUSTOMER;
                        break;
                    case "PROCESS_SERVER":
                        userRole = TenantUserRole.UserRole.PROCESS_SERVER;
                        break;
                    default:
                        userRole = TenantUserRole.UserRole.CUSTOMER;
                }
                
                role.setRole(userRole);
                tenantUserRoleRepository.save(role);
                log.info("Created tenant role {} for user {} in tenant {}", 
                    userRole, email, request.getTenantId());
            }
        }

        // Generate JWT token with proper parameters
        List<Map<String, String>> roles = tenantUserRoleRepository.findByGlobalUserId(user.getId())
                .stream()
                .map(role -> {
                    Map<String, String> roleMap = new HashMap<>();
                    roleMap.put("tenantId", role.getTenantId());
                    roleMap.put("role", role.getRole().toString());
                    roleMap.put("roleId", role.getId());
                    return roleMap;
                })
                .collect(java.util.stream.Collectors.toList());

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getIsSuperAdmin(), roles);

        return LoginResponse.builder()
                .token(token)
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .userId(user.getId())
                .isSuperAdmin(user.getIsSuperAdmin())
                .build();
    }

    private GoogleIdToken.Payload verifyGoogleToken(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                return idToken.getPayload();
            }
            return null;
        } catch (Exception e) {
            log.error("Error verifying Google token: {}", e.getMessage());
            return null;
        }
    }
}
