package com.processserve.user.controller;

import com.processserve.user.dto.CustomerDTO;
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
    public ResponseEntity<List<CustomerDTO>> getCustomersByTenant(@PathVariable String tenantId) {
        try {
            List<CustomerDTO> customers = customerService.getCustomersByTenantEnriched(tenantId);
            return ResponseEntity.ok(customers);
        } catch (Exception e) {
            log.error("Error fetching customers for tenant {}: {}", tenantId, e.getMessage(), e);
            throw e;
        }
    }
}
