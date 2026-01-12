package com.processserve.order.controller;

import com.processserve.order.dto.OrderDraftRequest;
import com.processserve.order.entity.OrderDraft;
import com.processserve.order.service.OrderDraftService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * OrderDraftController - REST API for order drafts
 * Endpoints follow patterns of major applications:
 * - Auto-save: POST /api/drafts (create/update)
 * - List drafts: GET /api/drafts/customer/{customerId}
 * - Resume draft: GET /api/drafts/{draftId}
 * - Delete draft: DELETE /api/drafts/{draftId}
 */
@RestController
@RequestMapping("/api/drafts")
@RequiredArgsConstructor
@Slf4j
public class OrderDraftController {

    private final OrderDraftService draftService;

    /**
     * Create a new draft (Auto-save from frontend)
     */
    @PostMapping
    public ResponseEntity<?> saveDraft(@Valid @RequestBody OrderDraftRequest request) {
        try {
            OrderDraft draft = draftService.saveDraft(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(draft);
        } catch (Exception e) {
            log.error("Failed to save draft: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Update existing draft (Auto-save)
     */
    @PutMapping("/{draftId}")
    public ResponseEntity<?> updateDraft(
            @PathVariable String draftId,
            @Valid @RequestBody OrderDraftRequest request) {
        try {
            OrderDraft draft = draftService.updateDraft(draftId, request);
            return ResponseEntity.ok(draft);
        } catch (Exception e) {
            log.error("Failed to update draft {}: {}", draftId, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get single draft by ID (Resume draft)
     */
    @GetMapping("/{draftId}")
    public ResponseEntity<?> getDraft(@PathVariable String draftId) {
        try {
            OrderDraft draft = draftService.getDraft(draftId);
            return ResponseEntity.ok(draft);
        } catch (Exception e) {
            log.error("Draft not found: {}", draftId);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * Get all drafts for a customer (Draft listing page)
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<OrderDraft>> getCustomerDrafts(@PathVariable String customerId) {
        List<OrderDraft> drafts = draftService.getCustomerDrafts(customerId);
        return ResponseEntity.ok(drafts);
    }

    /**
     * Get latest draft for quick recovery
     */
    @GetMapping("/customer/{customerId}/latest")
    public ResponseEntity<?> getLatestDraft(@PathVariable String customerId) {
        OrderDraft draft = draftService.getLatestDraft(customerId);
        if (draft == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(draft);
    }

    /**
     * Get draft count for customer
     */
    @GetMapping("/customer/{customerId}/count")
    public ResponseEntity<Map<String, Long>> getDraftCount(@PathVariable String customerId) {
        long count = draftService.getDraftCount(customerId);
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete a draft
     */
    @DeleteMapping("/{draftId}")
    public ResponseEntity<?> deleteDraft(@PathVariable String draftId) {
        try {
            draftService.deleteDraft(draftId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Draft deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to delete draft {}: {}", draftId, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Convert draft to order data (Called before order creation)
     */
    @GetMapping("/{draftId}/convert")
    public ResponseEntity<?> convertDraft(@PathVariable String draftId) {
        try {
            OrderDraft draft = draftService.convertDraftToOrder(draftId);
            return ResponseEntity.ok(draft);
        } catch (Exception e) {
            log.error("Failed to convert draft {}: {}", draftId, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Health check
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "order-draft-service");
        return ResponseEntity.ok(response);
    }
}
