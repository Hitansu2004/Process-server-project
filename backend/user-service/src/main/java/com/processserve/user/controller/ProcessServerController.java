package com.processserve.user.controller;

import com.processserve.user.entity.ProcessServerProfile;
import com.processserve.user.service.ProcessServerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/process-servers")
@RequiredArgsConstructor
@Slf4j
public class ProcessServerController {

    private final ProcessServerService processServerService;
    private final com.processserve.user.client.AuthClient authClient;

    @GetMapping("/{tenantUserRoleId}")
    public ResponseEntity<?> getProfile(@PathVariable String tenantUserRoleId) {
        log.info("Received request to fetch profile for tenantUserRoleId: {}", tenantUserRoleId);
        try {
            ProcessServerProfile profile = processServerService.getProfile(tenantUserRoleId);
            log.info("Found profile: {}", profile);

            // Fetch user details from auth-service
            com.processserve.user.dto.ProcessServerProfileDTO dto = new com.processserve.user.dto.ProcessServerProfileDTO(
                    profile);
            try {
                Map<String, Object> roleDetails = authClient.getRoleDetails(profile.getTenantUserRoleId());
                dto.setUserId((String) roleDetails.get("userId"));
                dto.setFirstName((String) roleDetails.get("firstName"));
                dto.setLastName((String) roleDetails.get("lastName"));
                dto.setEmail((String) roleDetails.get("email"));
                dto.setPhoneNumber((String) roleDetails.get("phoneNumber"));
            } catch (Exception e) {
                log.error("Failed to fetch user details for {}: {}", profile.getTenantUserRoleId(), e.getMessage());
                // Continue with partial data
            }

            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Failed to fetch profile for {}: {}", tenantUserRoleId, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/pending-approvals")
    public ResponseEntity<List<ProcessServerProfile>> getPendingApprovals() {
        return ResponseEntity.ok(processServerService.getPendingApprovals());
    }

    @PutMapping("/{tenantUserRoleId}/red-zone")
    public ResponseEntity<?> setRedZone(@PathVariable String tenantUserRoleId,
            @RequestParam boolean isRedZone) {
        try {
            processServerService.setRedZone(tenantUserRoleId, isRedZone);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Red zone status updated");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/{tenantUserRoleId}/stats")
    public ResponseEntity<?> updateStats(@PathVariable String tenantUserRoleId,
            @RequestBody Map<String, Object> request) {
        try {
            boolean successful = (Boolean) request.get("successful");
            int attemptCount = (Integer) request.get("attemptCount");
            processServerService.updateStats(tenantUserRoleId, successful, attemptCount);
            return ResponseEntity.ok(Map.of("message", "Stats updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/ratings")
    public ResponseEntity<?> addRating(@RequestBody Map<String, Object> request) {
        try {
            processServerService.addRating(
                    (String) request.get("orderId"),
                    (String) request.get("customerId"),
                    (String) request.get("processServerId"),
                    (Integer) request.get("ratingValue"),
                    (String) request.get("reviewText"));
            Map<String, String> response = new HashMap<>();
            response.put("message", "Rating added successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping
    public ResponseEntity<?> createProfile(@RequestBody Map<String, Object> request) {
        try {
            String tenantUserRoleId = (String) request.get("tenantUserRoleId");
            String operatingZipCodes = (String) request.get("operatingZipCodes");
            String tenantId = (String) request.get("tenantId");
            Boolean isGlobal = (Boolean) request.get("isGlobal");
            String profilePhotoUrl = (String) request.get("profilePhotoUrl");

            ProcessServerProfile profile = processServerService.createProfile(
                    tenantUserRoleId,
                    operatingZipCodes,
                    tenantId,
                    isGlobal != null ? isGlobal : false,
                    profilePhotoUrl);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<?> getProcessServersByTenant(
            @PathVariable String tenantId,
            @RequestParam(required = false, defaultValue = "ALL") String filter) {
        try {
            List<ProcessServerProfile> processServers = processServerService.getTenantProcessServers(tenantId, filter);
            return ResponseEntity.ok(processServers);
        } catch (Exception e) {
            e.printStackTrace(); // Print to console as well
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage(), "trace", e.getStackTrace()[0].toString()));
        }
    }

    @GetMapping("/details/{processServerId}")
    public ResponseEntity<?> getProcessServerDetails(@PathVariable String processServerId) {
        try {
            com.processserve.user.dto.ProcessServerDetailsDTO details = processServerService
                    .getProcessServerDetails(processServerId);
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
