package com.processserve.order.controller;

import com.processserve.order.dto.CreateOrderRequest;
import com.processserve.order.dto.RecordAttemptRequest;
import com.processserve.order.dto.UpdateOrderRequest;
import com.processserve.order.dto.CancelOrderRequest;
import com.processserve.order.dto.OrderEditabilityResponse;
// Removed pricing-related imports: ProposePriceRequest, CounterOfferRequest, AcceptNegotiationRequest, RejectNegotiationRequest
import com.processserve.order.dto.OrderDraftRequest;
import com.processserve.order.entity.Order;
import com.processserve.order.entity.OrderDraft;
import com.processserve.order.entity.OrderDocument;
// Removed pricing-related entity import: PriceNegotiation
import com.processserve.order.service.OrderService;
import com.processserve.order.service.OrderHistoryService;
// Removed pricing-related service import: PriceNegotiationService
import com.processserve.order.service.OrderDraftService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import java.util.Map;
import org.springframework.http.HttpHeaders;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderService orderService;
    private final OrderHistoryService historyService;
    // Removed pricing-related service field: PriceNegotiationService negotiationService
    private final OrderDraftService draftService;

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

    @PostMapping("/{id}/recalculate-totals")
    public ResponseEntity<?> recalculateOrderTotals(@PathVariable String id) {
        try {
            Order order = orderService.recalculateOrderTotals(id);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Order totals recalculated successfully");
            response.put("orderId", id);
            response.put("orderNumber", order.getOrderNumber());
            response.put("customerPaymentAmount", order.getCustomerPaymentAmount());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to recalculate totals for order {}: {}", id, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "order-service");
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/{id}/document", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadDocument(@PathVariable String id, @RequestParam("file") MultipartFile file) {
        try {
            String fileUrl = orderService.uploadDocument(id, file);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Document uploaded successfully");
            response.put("documentUrl", fileUrl);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to upload document: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/{id}/page-count")
    public ResponseEntity<?> getPageCount(@PathVariable String id) {
        try {
            Integer pageCount = orderService.getPageCount(id);
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", id);
            response.put("pageCount", pageCount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to get page count: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping(value = "/count-pages", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> countDocumentPages(@RequestParam("file") MultipartFile file) {
        try {
            log.info("Counting pages for temporary upload: {}", file.getOriginalFilename());
            int pageCount = orderService.countPagesFromUpload(file);
            Map<String, Object> response = new HashMap<>();
            response.put("filename", file.getOriginalFilename());
            response.put("pageCount", pageCount);
            response.put("fileSize", file.getSize());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to count pages: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to count pages: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/{id}/document")
    public ResponseEntity<Resource> downloadDocument(@PathVariable String id) {
        try {
            Resource resource = orderService.getDocument(id);
            String contentType = "application/octet-stream";
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            log.error("Failed to download document: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }

    }

    // ============================================
    // MULTIPLE DOCUMENTS FEATURE - New Endpoints
    // ============================================

    /**
     * Upload a new document to an order
     */
    @PostMapping(value = "/{id}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadOrderDocument(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "documentType", required = false) String documentType) {
        try {
            log.info("Uploading document for order: {}, type: {}", id, documentType);
            
            // Validate file size (50MB limit)
            long maxFileSize = 50 * 1024 * 1024; // 50MB in bytes
            if (file.getSize() > maxFileSize) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "File size exceeds 50MB limit");
                return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(error);
            }
            
            OrderDocument document = orderService.uploadOrderDocument(id, file, documentType);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Document uploaded successfully");
            response.put("document", document);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to upload document: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get all documents for an order
     */
    @GetMapping("/{id}/documents")
    public ResponseEntity<?> getOrderDocuments(@PathVariable String id) {
        try {
            log.info("Fetching documents for order: {}", id);
            List<OrderDocument> documents = orderService.getOrderDocuments(id);
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            log.error("Failed to fetch documents: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Download a specific document
     */
    @GetMapping("/documents/{documentId}/download")
    public ResponseEntity<Resource> downloadOrderDocument(@PathVariable String documentId) {
        try {
            log.info("Downloading document: {}", documentId);
            Resource resource = orderService.getOrderDocumentResource(documentId);
            String originalFilename = orderService.getDocumentOriginalFilename(documentId);
            
            String contentType = "application/octet-stream";
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + originalFilename + "\"")
                    .body(resource);
        } catch (Exception e) {
            log.error("Failed to download document: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete a specific document
     */
    @DeleteMapping("/documents/{documentId}")
    public ResponseEntity<?> deleteOrderDocument(@PathVariable String documentId) {
        try {
            log.info("Deleting document: {}", documentId);
            orderService.deleteOrderDocument(documentId);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Document deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to delete document: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ============================================
    // REQUIREMENT 8: Independent Recipient Editing & History Endpoints
    // ============================================

    @PutMapping("/recipients/{recipientId}")
    public ResponseEntity<?> updateRecipient(
            @PathVariable String recipientId,
            @Valid @RequestBody UpdateOrderRequest.RecipientUpdate request,
            @RequestHeader(value = "userId", required = false, defaultValue = "system") String userId,
            @RequestHeader(value = "userRole", required = false, defaultValue = "CUSTOMER") String role) {
        try {
            orderService.updateRecipientIndependent(recipientId, request, userId, role);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Failed to update recipient {}: {}", recipientId, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping(value = "/recipients/{recipientId}/document", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadRecipientDocument(
            @PathVariable String recipientId,
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "userId", required = false, defaultValue = "system") String userId,
            @RequestHeader(value = "userRole", required = false, defaultValue = "CUSTOMER") String role) {
        try {
            String fileUrl = orderService.uploadRecipientDocument(recipientId, file, userId, role);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Document uploaded successfully");
            response.put("documentUrl", fileUrl);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to upload recipient document: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/recipients/{recipientId}/document")
    public ResponseEntity<Resource> downloadRecipientDocument(@PathVariable String recipientId) {
        try {
            Resource resource = orderService.getRecipientDocument(recipientId);
            String contentType = "application/octet-stream";
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            log.error("Failed to download recipient document: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<?> getOrderHistory(@PathVariable String id) {
        return ResponseEntity.ok(historyService.getOrderHistory(id));
    }

    /**
     * Update the custom name of an order
     */
    @PutMapping("/{id}/custom-name")
    public ResponseEntity<?> updateOrderCustomName(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        try {
            String customName = request.get("customName");
            if (customName == null || customName.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Custom name is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            // Try to update regular order first
            try {
                Order order = orderService.updateOrderCustomName(id, customName);
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Order name updated successfully");
                response.put("orderId", id);
                response.put("customName", order.getCustomName());
                return ResponseEntity.ok(response);
            } catch (RuntimeException e) {
                // If order not found, try draft
                if (e.getMessage() != null && e.getMessage().contains("Order not found")) {
                    try {
                        OrderDraft draft = draftService.getDraft(id);
                        draft.setDraftName(customName.trim());
                        draftService.updateDraft(id, convertDraftToRequest(draft));
                        
                        Map<String, Object> response = new HashMap<>();
                        response.put("message", "Draft name updated successfully");
                        response.put("orderId", id);
                        response.put("customName", draft.getDraftName());
                        return ResponseEntity.ok(response);
                    } catch (Exception draftError) {
                        // Neither order nor draft found
                        log.error("Failed to update custom name for id {}: {}", id, e.getMessage());
                        throw e;
                    }
                } else {
                    // Some other runtime exception
                    throw e;
                }
            }
        } catch (IllegalArgumentException e) {
            log.error("Invalid custom name for order {}: {}", id, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            log.error("Failed to update custom name for order {}: {}", id, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Helper method to convert draft to request
    private OrderDraftRequest convertDraftToRequest(OrderDraft draft) {
        OrderDraftRequest request = new OrderDraftRequest();
        request.setTenantId(draft.getTenantId());
        request.setCustomerId(draft.getCustomerId());
        request.setDraftName(draft.getDraftName());
        request.setCurrentStep(draft.getCurrentStep());
        request.setDocumentData(draft.getDocumentData());
        request.setRecipientsData(draft.getRecipientsData());
        request.setServiceOptionsData(draft.getServiceOptionsData());
        return request;
    }

    // ============================================
    // PRICE NEGOTIATION ENDPOINTS - REMOVED
    // ============================================
    // All price negotiation endpoints have been removed as part of pricing feature removal:
    // - POST /recipients/{recipientId}/propose-price
    // - POST /negotiations/{negotiationId}/counter-offer
    // - POST /negotiations/{negotiationId}/accept
    // - POST /negotiations/{negotiationId}/reject
    // - GET /recipients/{recipientId}/negotiations
    // - GET /recipients/{recipientId}/negotiations/active
}
