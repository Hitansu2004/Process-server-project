package com.processserve.auth.service;

import com.processserve.auth.dto.LoginRequest;
import com.processserve.auth.dto.LoginResponse;
import com.processserve.auth.dto.RegisterRequest;
import com.processserve.auth.entity.GlobalUser;
import com.processserve.auth.entity.TenantUserRole;
import com.processserve.auth.repository.GlobalUserRepository;
import com.processserve.auth.repository.TenantUserRoleRepository;
import com.processserve.auth.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final GlobalUserRepository globalUserRepository;
    private final TenantUserRoleRepository tenantUserRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        log.info("Registering new user: {}", request.getEmail());

        // Check if user already exists
        if (globalUserRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Create global user
        GlobalUser globalUser = new GlobalUser();
        globalUser.setId(UUID.randomUUID().toString());
        globalUser.setEmail(request.getEmail());
        globalUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        globalUser.setFirstName(request.getFirstName());
        globalUser.setLastName(request.getLastName());
        globalUser.setPhoneNumber(request.getPhoneNumber());
        globalUser.setIsSuperAdmin(false);
        globalUser.setEmailVerified(true); // Auto-verify for now
        globalUser.setIsActive(true);

        globalUser = globalUserRepository.save(globalUser);

        // Create tenant user role
        TenantUserRole tenantUserRole = new TenantUserRole();
        tenantUserRole.setId(UUID.randomUUID().toString());
        tenantUserRole.setGlobalUser(globalUser);
        tenantUserRole.setTenantId(request.getTenantId());
        tenantUserRole.setRole(TenantUserRole.UserRole.valueOf(request.getRole()));
        tenantUserRole.setIsActive(true);

        tenantUserRoleRepository.save(tenantUserRole);

        log.info("User registered successfully: {}", globalUser.getId());

        // Return login response
        return generateLoginResponse(globalUser);
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        log.info("Login attempt for: {}", request.getEmail());

        GlobalUser globalUser = globalUserRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!globalUser.getIsActive()) {
            throw new RuntimeException("Account is inactive");
        }

        if (!passwordEncoder.matches(request.getPassword(), globalUser.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        // Update last login
        globalUser.setLastLogin(LocalDateTime.now());
        globalUserRepository.save(globalUser);

        log.info("Login successful for: {}", globalUser.getId());

        return generateLoginResponse(globalUser);
    }

    private LoginResponse generateLoginResponse(GlobalUser globalUser) {
        // Get user roles
        List<TenantUserRole> userRoles = tenantUserRoleRepository
                .findByGlobalUserIdAndIsActive(globalUser.getId(), true);

        // Prepare roles for JWT
        List<Map<String, String>> rolesForJwt = userRoles.stream()
                .map(role -> {
                    Map<String, String> roleMap = new HashMap<>();
                    roleMap.put("id", role.getId()); // Add ID to JWT as well
                    roleMap.put("tenantId", role.getTenantId());
                    roleMap.put("role", role.getRole().name());
                    return roleMap;
                })
                .collect(Collectors.toList());

        // Generate JWT token
        String token = jwtUtil.generateToken(
                globalUser.getId(),
                globalUser.getEmail(),
                globalUser.getIsSuperAdmin(),
                rolesForJwt);

        // Prepare roles for response (reuse the map structure to ensure ID is present)
        List<Map<String, String>> responseRoles = userRoles.stream()
                .map(role -> {
                    Map<String, String> roleMap = new HashMap<>();
                    roleMap.put("id", role.getId());
                    roleMap.put("tenantId", role.getTenantId());
                    roleMap.put("role", role.getRole().name());
                    return roleMap;
                })
                .collect(Collectors.toList());

        log.info("Generated roles for user {}: {}", globalUser.getId(), responseRoles);

        return LoginResponse.builder()
                .token(token)
                .userId(globalUser.getId())
                .email(globalUser.getEmail())
                .firstName(globalUser.getFirstName())
                .lastName(globalUser.getLastName())
                .isSuperAdmin(globalUser.getIsSuperAdmin())
                .roles(responseRoles)
                .build();
    }

    public GlobalUser getUserByEmail(String email) {
        return globalUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
