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

    @GetMapping("/{tenantUserRoleId}")
    public ResponseEntity<?> getProfile(@PathVariable String tenantUserRoleId) {
        log.info("Received request to fetch profile for tenantUserRoleId: {}", tenantUserRoleId);
        try {
            ProcessServerProfile profile = processServerService.getProfile(tenantUserRoleId);
            log.info("Found profile: {}", profile);
            return ResponseEntity.ok(profile);
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

            ProcessServerProfile profile = processServerService.createProfile(
                    tenantUserRoleId,
                    operatingZipCodes,
                    tenantId,
                    isGlobal != null ? isGlobal : false);
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
}
