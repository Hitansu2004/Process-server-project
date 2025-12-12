package com.processserve.order.controller;

import com.processserve.order.service.OrderRecalculationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final OrderRecalculationService recalculationService;

    /**
     * Endpoint to trigger recalculation of all completed orders
     * This fixes the super admin fee calculation for historical data
     */
    @PostMapping("/recalculate")
    public ResponseEntity<Map<String, String>> recalculateOrders() {
        log.info("Recalculation triggered via admin endpoint");

        try {
            recalculationService.recalculateAllCompletedOrders();

            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "All completed orders have been recalculated with correct super admin fees");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Recalculation failed: {}", e.getMessage(), e);

            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Recalculation failed: " + e.getMessage());

            return ResponseEntity.internalServerError().body(response);
        }
    }
}
