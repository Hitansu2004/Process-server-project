package com.processserve.auth.controller;

import com.processserve.auth.dto.LoginRequest;
import com.processserve.auth.dto.LoginResponse;
import com.processserve.auth.dto.RegisterRequest;
import com.processserve.auth.dto.RegistrationRequest;
import com.processserve.auth.dto.RegistrationResponse;
import com.processserve.auth.dto.GoogleAuthRequest;
import com.processserve.auth.dto.SendOtpRequest;
import com.processserve.auth.dto.VerifyOtpRequest;
import com.processserve.auth.entity.GlobalUser;
import com.processserve.auth.entity.TenantUserRole;
import com.processserve.auth.service.AuthService;
import com.processserve.auth.service.GoogleOAuthService;
import com.processserve.auth.service.OtpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final GoogleOAuthService googleOAuthService;
    private final OtpService otpService;
    private final com.processserve.auth.util.JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            log.info("Register request received for: {}", request.getEmail());
            LoginResponse response = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Registration failed: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/register/customer")
    public ResponseEntity<?> registerCustomer(@Valid @RequestBody RegistrationRequest request) {
        try {
            log.info("Customer registration request for: {} in tenant: {}", request.getEmail(), request.getTenantId());
            RegistrationResponse response = authService.registerCustomer(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Customer registration failed: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/register/process-server")
    public ResponseEntity<?> registerProcessServer(@Valid @RequestBody RegistrationRequest request) {
        try {
            log.info("Process server registration request for: {} in tenant: {}", request.getEmail(),
                    request.getTenantId());
            RegistrationResponse response = authService.registerProcessServer(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Process server registration failed: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/register/admin")
    public ResponseEntity<?> registerAdmin(@Valid @RequestBody RegistrationRequest request) {
        try {
            log.info("Admin registration request for: {} in tenant: {}", request.getEmail(), request.getTenantId());
            RegistrationResponse response = authService.registerAdmin(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Admin registration failed: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            log.info("Login request received for: {}", request.getEmail());
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Login failed: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            // Extract email from token (simplified - in production use proper JWT filter)
            String email = extractEmailFromToken(authHeader);
            GlobalUser user = authService.getUserByEmail(email);

            Map<String, Object> response = new HashMap<>();
            response.put("userId", user.getId());
            response.put("email", user.getEmail());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("isSuperAdmin", user.getIsSuperAdmin());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Get current user failed: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "auth-service");
        return ResponseEntity.ok(response);
    }

    private String extractEmailFromToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtUtil.extractEmail(token);
        }
        throw new RuntimeException("Invalid authorization header");
    }

    @GetMapping("/roles/{id}")
    public ResponseEntity<?> getRoleDetails(@PathVariable String id) {
        try {
            TenantUserRole role = authService.getTenantUserRole(id);
            GlobalUser user = role.getGlobalUser();

            Map<String, Object> response = new HashMap<>();
            response.put("id", role.getId());
            response.put("tenantId", role.getTenantId());
            response.put("role", role.getRole());
            response.put("userId", user.getId());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("email", user.getEmail());
            response.put("phoneNumber", user.getPhoneNumber());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleAuth(@Valid @RequestBody GoogleAuthRequest request) {
        try {
            log.info("Google OAuth authentication request received");
            LoginResponse response = googleOAuthService.authenticateWithGoogle(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Google OAuth authentication failed: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Google authentication failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        try {
            log.info("OTP request for email: {}", request.getEmail());
            
            // Check if email already exists
            if (authService.emailExists(request.getEmail())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Email already registered. Please login instead."));
            }
            
            otpService.sendOtp(request.getEmail(), request.getFirstName(), request.getLastName());
            
            return ResponseEntity.ok(Map.of(
                    "message", "OTP sent successfully to " + request.getEmail(),
                    "email", request.getEmail()
            ));
        } catch (Exception e) {
            log.error("Failed to send OTP: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to send OTP: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        try {
            log.info("OTP verification for email: {}", request.getEmail());
            
            boolean isValid = otpService.verifyOtp(request.getEmail(), request.getOtp());
            
            if (isValid) {
                return ResponseEntity.ok(Map.of(
                        "message", "Email verified successfully",
                        "verified", true,
                        "email", request.getEmail()
                ));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of(
                                "error", "Invalid or expired OTP",
                                "verified", false
                        ));
            }
        } catch (Exception e) {
            log.error("OTP verification failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Verification failed: " + e.getMessage()));
        }
    }
}
