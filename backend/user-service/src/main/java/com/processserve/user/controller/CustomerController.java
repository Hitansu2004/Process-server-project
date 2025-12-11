package com.processserve.user.controller;

import com.processserve.user.entity.CustomerProfile;
import com.processserve.user.service.CustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@Slf4j
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping("/{globalUserId}")
    public ResponseEntity<?> getProfile(@PathVariable String globalUserId) {
        try {
            CustomerProfile profile = customerService.getProfile(globalUserId);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<List<CustomerProfile>> getCustomersByTenant(@PathVariable String tenantId) {
        // For now, return all customers since we don't track tenantId in
        // CustomerProfile
        // In production, you would add tenantId field to CustomerProfile entity
        List<CustomerProfile> customers = customerService.getAllCustomers();
        return ResponseEntity.ok(customers);
    }
}
