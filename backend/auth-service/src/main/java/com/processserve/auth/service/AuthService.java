package com.processserve.auth.service;

import com.processserve.auth.dto.LoginRequest;
import com.processserve.auth.dto.LoginResponse;
import com.processserve.auth.dto.RegisterRequest;
import com.processserve.auth.dto.RegistrationRequest;
import com.processserve.auth.dto.RegistrationResponse;
import com.processserve.auth.entity.GlobalUser;
import com.processserve.auth.entity.TenantUserRole;
import com.processserve.auth.repository.GlobalUserRepository;
import com.processserve.auth.repository.TenantUserRoleRepository;
import com.processserve.auth.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

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
    private final RestTemplate restTemplate;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;
    private final OtpService otpService;
    private final EmailService emailService;

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        log.info("Registering new user: {}", request.getEmail());

        // Check if user already exists
        if (globalUserRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // For non-Gmail users, check if email is verified via OTP
        if (!request.getEmail().toLowerCase().endsWith("@gmail.com")) {
            if (!otpService.isEmailVerified(request.getEmail())) {
                throw new RuntimeException("Email not verified. Please verify your email with OTP first.");
            }
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
        globalUser.setEmailVerified(false);
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

        // Send welcome email
        try {
            emailService.sendWelcomeEmail(globalUser.getEmail(), 
                globalUser.getFirstName() + " " + globalUser.getLastName());
        } catch (Exception e) {
            log.warn("Failed to send welcome email, but registration succeeded: {}", e.getMessage());
        }

        // Return login response
        return generateLoginResponse(globalUser, request.getTenantId());
    }

    public RegistrationResponse registerCustomer(RegistrationRequest request) {
        log.info("Registering customer: {} for tenant: {}", request.getEmail(), request.getTenantId());

        // Validate tenant exists (call tenant service)
        validateTenant(request.getTenantId());

        // Perform database operations in a separate transaction
        TenantUserRole tenantUserRole = registerCustomerInDatabase(request);

        // IMPORTANT: Transaction is committed at this point, locks are released
        // Now we can safely call external user-service without holding database locks
        try {
            createCustomerProfile(tenantUserRole.getId(), request);
        } catch (Exception e) {
            log.error(
                    "Failed to create customer profile for tenantUserRoleId: {}. User and role created successfully but profile creation failed: {}",
                    tenantUserRole.getId(), e.getMessage());
            // User and role are already committed, so customer can still login
            // They just won't have a profile in user-service yet
            throw new RuntimeException(
                    "Registration partially completed. Please contact support. Error: " + e.getMessage());
        }

        log.info("Customer registered successfully: {}", tenantUserRole.getGlobalUser().getId());

        return new RegistrationResponse(true, "Customer registered successfully. Please login.",
                tenantUserRole.getGlobalUser().getId());
    }

    @Transactional
    private TenantUserRole registerCustomerInDatabase(RegistrationRequest request) {
        // Check if email already registered in this tenant
        checkEmailUniquenessInTenant(request.getEmail(), request.getTenantId());

        // Create global user
        GlobalUser globalUser = createGlobalUser(request);

        // Create tenant user role for customer
        TenantUserRole tenantUserRole = createTenantUserRole(globalUser, request.getTenantId(),
                TenantUserRole.UserRole.CUSTOMER);

        return tenantUserRole;
    }

    public RegistrationResponse registerProcessServer(RegistrationRequest request) {
        log.info("Registering process server: {} for tenant: {}", request.getEmail(), request.getTenantId());

        // Validate tenant
        validateTenant(request.getTenantId());

        // Perform database operations in a separate transaction
        TenantUserRole tenantUserRole = registerProcessServerInDatabase(request);

        // Create process server profile via user-service
        // Transaction is committed, so user-service can see the FK reference
        try {
            createProcessServerProfile(tenantUserRole.getId(), request);
        } catch (Exception e) {
            log.error("Failed to create process server profile: {}", e.getMessage());
            // Note: User is already created. We might want to rollback or mark as
            // incomplete,
            // but for now we just throw the error.
            throw new RuntimeException("Failed to create process server profile: " + e.getMessage());
        }

        log.info("Process server registered successfully: {}", tenantUserRole.getGlobalUser().getId());

        return new RegistrationResponse(true,
                "Process server registration submitted. Awaiting admin approval.",
                tenantUserRole.getGlobalUser().getId());
    }

    @Transactional
    private TenantUserRole registerProcessServerInDatabase(RegistrationRequest request) {
        // Check email uniqueness in tenant
        checkEmailUniquenessInTenant(request.getEmail(), request.getTenantId());

        // Create global user
        GlobalUser globalUser = createGlobalUser(request);

        // Create tenant user role for process server
        TenantUserRole tenantUserRole = createTenantUserRole(globalUser, request.getTenantId(),
                TenantUserRole.UserRole.PROCESS_SERVER);

        return tenantUserRole;
    }

    @Transactional
    public RegistrationResponse registerAdmin(RegistrationRequest request) {
        log.info("Registering admin: {} for tenant: {}", request.getEmail(), request.getTenantId());

        // Validate tenant
        validateTenant(request.getTenantId());

        // Check email uniqueness in tenant
        checkEmailUniquenessInTenant(request.getEmail(), request.getTenantId());

        // Create global user
        GlobalUser globalUser = createGlobalUser(request);

        // Create tenant user role for admin
        TenantUserRole tenantUserRole = createTenantUserRole(globalUser, request.getTenantId(),
                TenantUserRole.UserRole.TENANT_ADMIN);

        log.info("Admin registered successfully: {}", globalUser.getId());

        return new RegistrationResponse(true, "Admin registered successfully. Please login.", globalUser.getId());
    }

    // Helper methods

    private void validateTenant(String tenantId) {
        try {
            restTemplate.getForObject("http://TENANT-SERVICE/api/tenants/" + tenantId, Map.class);
        } catch (Exception e) {
            throw new RuntimeException("Invalid tenant ID: " + tenantId);
        }
    }

    private void checkEmailUniquenessInTenant(String email, String tenantId) {
        // Check if this email already has a role in this tenant
        globalUserRepository.findByEmail(email).ifPresent(user -> {
            List<TenantUserRole> roles = tenantUserRoleRepository
                    .findByGlobalUserIdAndIsActive(user.getId(), true);

            boolean existsInTenant = roles.stream()
                    .anyMatch(role -> role.getTenantId().equals(tenantId));

            if (existsInTenant) {
                throw new RuntimeException("Email already registered in this tenant");
            }
        });
    }

    private GlobalUser createGlobalUser(RegistrationRequest request) {
        // Check if global user exists with this email
        GlobalUser globalUser = globalUserRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (globalUser == null) {
            // Create new global user
            globalUser = new GlobalUser();
            globalUser.setId(UUID.randomUUID().toString());
            globalUser.setEmail(request.getEmail());
            globalUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            globalUser.setFirstName(request.getFirstName());
            globalUser.setLastName(request.getLastName());
            globalUser.setPhoneNumber(request.getPhoneNumber());
            globalUser.setIsSuperAdmin(false);
            globalUser.setEmailVerified(false);
            globalUser.setIsActive(true);

            globalUser = globalUserRepository.save(globalUser);
        } else {
            // User exists in another tenant - verify password matches
            if (!passwordEncoder.matches(request.getPassword(), globalUser.getPasswordHash())) {
                throw new RuntimeException("Email already exists with different credentials");
            }
        }

        return globalUser;
    }

    private TenantUserRole createTenantUserRole(GlobalUser globalUser, String tenantId, TenantUserRole.UserRole role) {
        TenantUserRole tenantUserRole = new TenantUserRole();
        tenantUserRole.setId(UUID.randomUUID().toString());
        tenantUserRole.setGlobalUser(globalUser);
        tenantUserRole.setTenantId(tenantId);
        tenantUserRole.setRole(role);
        tenantUserRole.setIsActive(true);

        // Use saveAndFlush to ensure the record is committed to DB before calling
        // external user-service
        return tenantUserRoleRepository.saveAndFlush(tenantUserRole);
    }

    private void createCustomerProfile(String tenantUserRoleId, RegistrationRequest request) {
        try {
            Map<String, Object> profileRequest = new HashMap<>();
            profileRequest.put("tenantUserRoleId", tenantUserRoleId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(profileRequest, headers);

            restTemplate.postForObject("http://USER-SERVICE/api/customers", entity, Map.class);
        } catch (Exception e) {
            log.error("Failed to create customer profile: {}", e.getMessage());
            throw new RuntimeException("Failed to create customer profile: " + e.getMessage());
        }
    }

    private void createProcessServerProfile(String tenantUserRoleId, RegistrationRequest request) {
        try {
            Map<String, Object> profileRequest = new HashMap<>();
            profileRequest.put("tenantUserRoleId", tenantUserRoleId);

            // Convert comma-separated string to JSON array string
            String zipCodes = request.getOperatingZipCodes();
            String zipCodesJson = "[]";
            if (zipCodes != null && !zipCodes.trim().isEmpty()) {
                List<String> zipList = java.util.Arrays.stream(zipCodes.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .collect(Collectors.toList());
                zipCodesJson = objectMapper.writeValueAsString(zipList);
            }

            profileRequest.put("operatingZipCodes", zipCodesJson);
            profileRequest.put("tenantId", request.getTenantId());
            profileRequest.put("isGlobal", false);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(profileRequest, headers);

            restTemplate.postForObject("http://USER-SERVICE/api/process-servers", entity, Map.class);
        } catch (Exception e) {
            log.error("Failed to create process server profile: {}", e.getMessage());
            throw new RuntimeException("Failed to create process server profile: " + e.getMessage());
        }
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        log.info("Login attempt for: {} in tenant: {}", request.getEmail(), request.getTenantId());

        GlobalUser globalUser = globalUserRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!globalUser.getIsActive()) {
            throw new RuntimeException("Account is inactive");
        }

        if (!passwordEncoder.matches(request.getPassword(), globalUser.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        // TENANT VALIDATION: Check if user has access to requested tenant
        if (request.getTenantId() != null && !request.getTenantId().isEmpty()) {
            List<TenantUserRole> userRoles = tenantUserRoleRepository
                    .findByGlobalUserIdAndIsActive(globalUser.getId(), true);

            boolean hasAccessToTenant = userRoles.stream()
                    .anyMatch(role -> role.getTenantId().equals(request.getTenantId()));

            if (!hasAccessToTenant) {
                // Check if user exists in other tenants
                if (!userRoles.isEmpty()) {
                    throw new RuntimeException(
                            "You are not registered in this tenant. Please register or select the correct tenant.");
                } else {
                    throw new RuntimeException("Invalid email or password");
                }
            }
        }

        // Update last login
        globalUser.setLastLogin(LocalDateTime.now());
        globalUserRepository.save(globalUser);

        log.info("Login successful for: {} in tenant: {}", globalUser.getId(), request.getTenantId());

        return generateLoginResponse(globalUser, request.getTenantId());
    }

    private LoginResponse generateLoginResponse(GlobalUser globalUser, String tenantId) {
        // Get user roles
        List<TenantUserRole> userRoles = tenantUserRoleRepository
                .findByGlobalUserIdAndIsActive(globalUser.getId(), true);

        // Filter by tenant if specified
        if (tenantId != null && !tenantId.isEmpty()) {
            userRoles = userRoles.stream()
                    .filter(role -> role.getTenantId().equals(tenantId))
                    .collect(Collectors.toList());
        }

        // Prepare roles for JWT
        List<Map<String, String>> rolesForJwt = userRoles.stream()
                .map(role -> {
                    Map<String, String> roleMap = new HashMap<>();
                    roleMap.put("id", role.getId());
                    roleMap.put("tenantId", role.getTenantId());
                    roleMap.put("role", role.getRole().name());
                    return roleMap;
                })
                .collect(Collectors.toList());

        // Generate JWT token with tenant context
        String token = jwtUtil.generateToken(
                globalUser.getId(),
                globalUser.getEmail(),
                globalUser.getIsSuperAdmin(),
                rolesForJwt);

        // Prepare roles for response
        List<Map<String, String>> responseRoles = userRoles.stream()
                .map(role -> {
                    Map<String, String> roleMap = new HashMap<>();
                    roleMap.put("id", role.getId());
                    roleMap.put("tenantId", role.getTenantId());
                    roleMap.put("role", role.getRole().name());
                    return roleMap;
                })
                .collect(Collectors.toList());

        log.info("Generated roles for user {} in tenant {}: {}", globalUser.getId(), tenantId, responseRoles);

        return LoginResponse.builder()
                .token(token)
                .userId(globalUser.getId())
                .email(globalUser.getEmail())
                .firstName(globalUser.getFirstName())
                .lastName(globalUser.getLastName())
                .isSuperAdmin(globalUser.getIsSuperAdmin())
                .emailVerified(globalUser.getEmailVerified())
                .roles(responseRoles)
                .build();
    }

    public GlobalUser getUserByEmail(String email) {
        return globalUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public TenantUserRole getTenantUserRole(String id) {
        return tenantUserRoleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("TenantUserRole not found"));
    }

    public boolean emailExists(String email) {
        return globalUserRepository.existsByEmail(email);
    }

    public GlobalUser saveUser(GlobalUser user) {
        return globalUserRepository.save(user);
    }
}
