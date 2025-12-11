package com.processserve.order.controller;

import com.processserve.order.dto.CreateOrderRequest;
import com.processserve.order.dto.RecordAttemptRequest;
import com.processserve.order.entity.Order;
import com.processserve.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<?> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        try {
            Order order = orderService.createOrder(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (Exception e) {
            log.error("Failed to create order: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrder(@PathVariable String id) {
        try {
            Order order = orderService.getOrderById(id);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Order>> getOrdersByCustomer(@PathVariable String customerId) {
        List<Order> orders = orderService.getOrdersByCustomerId(customerId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/process-server/{processServerId}")
    public ResponseEntity<List<Order>> getOrdersByProcessServer(@PathVariable String processServerId) {
        List<Order> orders = orderService.getOrdersByProcessServerId(processServerId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/available")
    public ResponseEntity<List<Order>> getAvailableOrders() {
        // Return all OPEN and BIDDING orders
        List<Order> orders = orderService.getAvailableOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<List<Order>> getOrdersByTenant(@PathVariable String tenantId) {
        List<Order> orders = orderService.getOrdersByTenantId(tenantId);
        return ResponseEntity.ok(orders);
    }

    @PostMapping("/attempts")
    public ResponseEntity<?> recordAttempt(@Valid @RequestBody RecordAttemptRequest request) {
        try {
            orderService.recordAttempt(request);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Attempt recorded successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to record attempt: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Object>> getPlatformRevenue() {
        try {
            Map<String, Object> response = new HashMap<>();
            response.put("revenue", orderService.getPlatformRevenue());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to get platform revenue: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/validate-rating")
    public ResponseEntity<Boolean> validateRatingEligibility(
            @RequestParam String orderId,
            @RequestParam String customerId,
            @RequestParam String processServerId) {
        return ResponseEntity.ok(orderService.validateRatingEligibility(orderId, customerId, processServerId));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "order-service");
        return ResponseEntity.ok(response);
    }
}
