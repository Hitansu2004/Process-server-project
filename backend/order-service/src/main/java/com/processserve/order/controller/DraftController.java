package com.processserve.order.controller;

import com.processserve.order.dto.DraftRequest;
import com.processserve.order.dto.DraftResponse;
import com.processserve.order.model.OrderDraft;
import com.processserve.order.model.OrderDraftData;
import com.processserve.order.service.DraftService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST Controller for draft management.
 * Provides simple endpoints with NO validation!
 */
@RestController
@RequestMapping("/api/drafts")
@Slf4j
public class DraftController {

    @Autowired
    private DraftService draftService;

    /**
     * Save or update a draft
     * POST /api/drafts
     */
    @PostMapping
    public ResponseEntity<?> saveDraft(@RequestBody DraftRequest request) {
        try {
            log.info("Saving draft for customer: {}", request.getCustomerId());

            OrderDraft draft = draftService.saveDraft(
                    request.getDraftId(),
                    request.getCustomerId(),
                    request.getTenantId(),
                    request.getCurrentStep(),
                    request.getDocumentData(),
                    request.getRecipientsData(),
                    request.getServiceOptionsData());

            DraftResponse response = convertToResponse(draft);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            log.error("Failed to save draft: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get a specific draft
     * GET /api/drafts/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getDraft(@PathVariable String id) {
        try {
            OrderDraft draft = draftService.getDraft(id);
            DraftResponse response = convertToResponse(draft);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to get draft: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * Get all drafts for a customer
     * GET /api/drafts/customer/{customerId}
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<DraftResponse>> getCustomerDrafts(@PathVariable String customerId) {
        try {
            List<OrderDraft> drafts = draftService.getCustomerDrafts(customerId);
            List<DraftResponse> responses = drafts.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(responses);

        } catch (Exception e) {
            log.error("Failed to get customer drafts: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get latest draft for a customer
     * GET /api/drafts/customer/{customerId}/latest
     */
    @GetMapping("/customer/{customerId}/latest")
    public ResponseEntity<?> getLatestDraft(@PathVariable String customerId) {
        try {
            OrderDraft draft = draftService.getLatestDraft(customerId);
            if (draft == null) {
                return ResponseEntity.noContent().build();
            }
            DraftResponse response = convertToResponse(draft);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to get latest draft: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Delete a draft
     * DELETE /api/drafts/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDraft(@PathVariable String id) {
        try {
            draftService.deleteDraft(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Draft deleted successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to delete draft: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Delete all drafts for a customer
     * DELETE /api/drafts/customer/{customerId}
     */
    @DeleteMapping("/customer/{customerId}")
    public ResponseEntity<?> deleteCustomerDrafts(@PathVariable String customerId) {
        try {
            draftService.deleteCustomerDrafts(customerId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "All drafts deleted successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to delete customer drafts: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Clean up expired drafts (admin endpoint)
     * POST /api/drafts/cleanup
     */
    @PostMapping("/cleanup")
    public ResponseEntity<?> cleanupExpiredDrafts() {
        try {
            int deleted = draftService.cleanupExpiredDrafts();
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Expired drafts cleaned up");
            response.put("deleted", deleted);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to cleanup drafts: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Convert OrderDraft to DraftResponse DTO
     */
    private DraftResponse convertToResponse(OrderDraft draft) {
        DraftResponse response = new DraftResponse();
        response.setId(draft.getId());
        response.setCustomerId(draft.getCustomerId());
        response.setTenantId(draft.getTenantId());
        response.setDraftName(draft.getDraftName());
        response.setCurrentStep(draft.getCurrentStep());
        response.setIsComplete(draft.getIsComplete());
        response.setCreatedAt(draft.getCreatedAt());
        response.setUpdatedAt(draft.getUpdatedAt());
        response.setExpiresAt(draft.getExpiresAt());

        OrderDraftData draftData = draft.getDraftData();
        if (draftData != null) {
            response.setDocumentData(draftData.getDocumentData());
            response.setRecipientsData(draftData.getRecipientsData());
            response.setServiceOptionsData(draftData.getServiceOptionsData());
        }

        return response;
    }
}
