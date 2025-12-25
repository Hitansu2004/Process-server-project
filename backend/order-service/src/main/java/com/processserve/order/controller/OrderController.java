package com.processserve.order.controller;

import com.processserve.order.dto.CreateOrderRequest;
import com.processserve.order.dto.RecordAttemptRequest;
import com.processserve.order.dto.UpdateOrderRequest;
import com.processserve.order.dto.CancelOrderRequest;
import com.processserve.order.dto.OrderEditabilityResponse;
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

    @DeleteMapping("/invitation/{invitationId}/cleanup")
    public ResponseEntity<?> cleanupOrdersForInvitation(@PathVariable String invitationId) {
        try {
            orderService.cleanupOrdersForInvitation(invitationId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Failed to cleanup orders for invitation: {}", invitationId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/validate-rating")
    public ResponseEntity<Boolean> validateRatingEligibility(
            @RequestParam String orderId,
            @RequestParam String customerId,
            @RequestParam String processServerId) {
        return ResponseEntity.ok(orderService.validateRatingEligibility(orderId, customerId, processServerId));
    }

    // Requirement 5: Case Object Search Endpoints
    @GetMapping("/search/case")
    public ResponseEntity<?> searchByCaseNumber(@RequestParam String caseNumber) {
        try {
            List<Order> orders = orderService.searchByCaseNumber(caseNumber);
            Map<String, Object> response = new HashMap<>();
            response.put("caseNumber", caseNumber);
            response.put("orderCount", orders.size());
            response.put("orders", orders);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to search by case number: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/search/jurisdiction")
    public ResponseEntity<?> searchByJurisdiction(@RequestParam String jurisdiction) {
        try {
            List<Order> orders = orderService.searchByJurisdiction(jurisdiction);
            Map<String, Object> response = new HashMap<>();
            response.put("jurisdiction", jurisdiction);
            response.put("orderCount", orders.size());
            response.put("orders", orders);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to search by jurisdiction: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/search/case-info")
    public ResponseEntity<?> searchByCaseInfo(@RequestParam String query) {
        try {
            List<Order> orders = orderService.searchByCaseInfo(query);
            Map<String, Object> response = new HashMap<>();
            response.put("query", query);
            response.put("orderCount", orders.size());
            response.put("orders", orders);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to search case info: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ============================================
    // REQUIREMENT 8: Order Management & Editing Endpoints
    // ============================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateOrder(
            @PathVariable String id,
            @Valid @RequestBody UpdateOrderRequest request,
            @RequestHeader(value = "userId", required = false, defaultValue = "system") String userId) {
        try {
            Order updatedOrder = orderService.updateOrder(id, request, userId);
            return ResponseEntity.ok(updatedOrder);
        } catch (Exception e) {
            log.error("Failed to update order {}: {}", id, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(
            @PathVariable String id,
            @Valid @RequestBody CancelOrderRequest request,
            @RequestHeader(value = "userId", required = false, defaultValue = "system") String userId) {
        try {
            orderService.cancelOrder(id, userId, request);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Order cancelled successfully");
            response.put("orderId", id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to cancel order {}: {}", id, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/{id}/edit-status")
    public ResponseEntity<?> checkEditability(@PathVariable String id) {
        try {
            Order order = orderService.getOrderById(id);
            OrderEditabilityResponse response = new OrderEditabilityResponse();
            response.setCanEdit(order.canBeEdited());
            response.setStatus(order.getStatus().toString());
            response.setModificationCount(order.getModificationCount() != null ? order.getModificationCount() : 0);

            if (!order.canBeEdited()) {
                String lockReason = switch (order.getStatus()) {
                    case ASSIGNED -> "Order cannot be edited after assignment";
                    case IN_PROGRESS -> "Order is currently being delivered";
                    case COMPLETED -> "Completed orders cannot be modified";
                    case FAILED -> "Failed orders cannot be modified";
                    case CANCELLED -> "Cancelled orders cannot be modified";
                    case PARTIALLY_ASSIGNED -> "Order cannot be edited after assignment";
                    default -> "Order cannot be edited in current status";
                };
                response.setLockReason(lockReason);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to check editability for order {}: {}", id, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping("/counts")
    public ResponseEntity<?> getOrderCounts(
            @RequestParam(required = false) String customerId,
            @RequestParam(required = false) String tenantId) {
        try {
            List<Order> orders;

            if (customerId != null) {
                orders = orderService.getOrdersByCustomerId(customerId);
            } else if (tenantId != null) {
                orders = orderService.getOrdersByTenantId(tenantId);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Either customerId or tenantId must be provided");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            Map<String, Long> counts = new HashMap<>();
            counts.put("DRAFT", orders.stream().filter(o -> o.getStatus() == Order.OrderStatus.DRAFT).count());
            counts.put("OPEN", orders.stream().filter(o -> o.getStatus() == Order.OrderStatus.OPEN).count());
            counts.put("BIDDING", orders.stream().filter(o -> o.getStatus() == Order.OrderStatus.BIDDING).count());
            counts.put("ASSIGNED", orders.stream().filter(o -> o.getStatus() == Order.OrderStatus.ASSIGNED
                    || o.getStatus() == Order.OrderStatus.PARTIALLY_ASSIGNED).count());
            counts.put("IN_PROGRESS",
                    orders.stream().filter(o -> o.getStatus() == Order.OrderStatus.IN_PROGRESS).count());
            counts.put("COMPLETED", orders.stream().filter(o -> o.getStatus() == Order.OrderStatus.COMPLETED).count());
            counts.put("FAILED", orders.stream().filter(o -> o.getStatus() == Order.OrderStatus.FAILED).count());
            counts.put("CANCELLED", orders.stream().filter(o -> o.getStatus() == Order.OrderStatus.CANCELLED).count());
            counts.put("TOTAL", (long) orders.size());

            return ResponseEntity.ok(counts);
        } catch (Exception e) {
            log.error("Failed to get order counts: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "order-service");
        return ResponseEntity.ok(response);
    }
}
