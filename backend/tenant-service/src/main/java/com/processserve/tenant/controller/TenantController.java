package com.processserve.tenant.controller;

import com.processserve.tenant.entity.Tenant;
import com.processserve.tenant.service.TenantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tenants")
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;

    @PostMapping
    public ResponseEntity<?> createTenant(@RequestBody Map<String, String> request) {
        try {
            Tenant tenant = tenantService.createTenant(
                    request.get("name"),
                    request.get("domainUrl"));
            return ResponseEntity.status(HttpStatus.CREATED).body(tenant);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping
    public ResponseEntity<List<Tenant>> getAllTenants() {
        return ResponseEntity.ok(tenantService.getAllTenants());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTenant(@PathVariable String id) {
        try {
            return ResponseEntity.ok(tenantService.getTenantById(id));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/settings")
    public ResponseEntity<?> updateTenantSettings(
            @PathVariable String id,
            @RequestBody Map<String, String> settings) {
        try {
            Tenant tenant = tenantService.updateTenantSettings(
                    id,
                    settings.get("businessHours"),
                    settings.get("pricingConfig"),
                    settings.get("notificationSettings"));
            return ResponseEntity.ok(tenant);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTenant(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        try {
            Tenant tenant = tenantService.updateTenantInfo(
                    id,
                    request.get("name"),
                    request.get("domainUrl"),
                    request.get("subscriptionTier"));
            return ResponseEntity.ok(tenant);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
