package com.processserve.order.service;

import com.processserve.order.dto.OrderDraftRequest;
import com.processserve.order.entity.OrderDraft;
import com.processserve.order.repository.OrderDraftRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * OrderDraftService - Manages order drafts like major applications
 * Features:
 * - Auto-save functionality
 * - Multiple drafts per user
 * - Draft expiration (7 days)
 * - Seamless recovery
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderDraftService {

    private final OrderDraftRepository draftRepository;

    /**
     * Save or update a draft (Auto-save)
     */
    @Transactional
    public OrderDraft saveDraft(OrderDraftRequest request) {
        log.info("Saving draft for customer: {}", request.getCustomerId());

        OrderDraft draft = new OrderDraft();
        draft.setId(UUID.randomUUID().toString());
        draft.setTenantId(request.getTenantId());
        draft.setCustomerId(request.getCustomerId());
        draft.setDraftName(request.getDraftName());
        draft.setCurrentStep(request.getCurrentStep() != null ? request.getCurrentStep() : 1);
        draft.setIsComplete(request.getIsComplete() != null ? request.getIsComplete() : false);
        draft.setDocumentData(request.getDocumentData());
        draft.setRecipientsData(request.getRecipientsData());
        draft.setServiceOptionsData(request.getServiceOptionsData());
        draft.setDocumentsData(request.getDocumentsData());

        return draftRepository.save(draft);
    }

    /**
     * Update existing draft
     */
    @Transactional
    public OrderDraft updateDraft(String draftId, OrderDraftRequest request) {
        log.info("Updating draft: {}", draftId);

        OrderDraft draft = draftRepository.findById(draftId)
                .orElseThrow(() -> new RuntimeException("Draft not found: " + draftId));

        if (request.getDraftName() != null) {
            draft.setDraftName(request.getDraftName());
        }
        if (request.getCurrentStep() != null) {
            draft.setCurrentStep(request.getCurrentStep());
        }
        if (request.getIsComplete() != null) {
            draft.setIsComplete(request.getIsComplete());
        }
        if (request.getDocumentData() != null) {
            draft.setDocumentData(request.getDocumentData());
        }
        if (request.getRecipientsData() != null) {
            draft.setRecipientsData(request.getRecipientsData());
        }
        if (request.getServiceOptionsData() != null) {
            draft.setServiceOptionsData(request.getServiceOptionsData());
        }
        if (request.getDocumentsData() != null) {
            draft.setDocumentsData(request.getDocumentsData());
        }

        return draftRepository.save(draft);
    }

    /**
     * Get single draft by ID
     */
    public OrderDraft getDraft(String draftId) {
        return draftRepository.findById(draftId)
                .orElseThrow(() -> new RuntimeException("Draft not found: " + draftId));
    }

    /**
     * Get all drafts for a customer (for draft listing page)
     */
    public List<OrderDraft> getCustomerDrafts(String customerId) {
        return draftRepository.findByCustomerIdOrderByUpdatedAtDesc(customerId);
    }

    /**
     * Get latest draft for quick recovery
     */
    public OrderDraft getLatestDraft(String customerId) {
        return draftRepository.findFirstByCustomerIdOrderByUpdatedAtDesc(customerId)
                .orElse(null);
    }

    /**
     * Delete a draft
     */
    @Transactional
    public void deleteDraft(String draftId) {
        log.info("Deleting draft: {}", draftId);
        draftRepository.deleteById(draftId);
    }

    /**
     * Get draft count for customer
     */
    public long getDraftCount(String customerId) {
        return draftRepository.countByCustomerId(customerId);
    }

    /**
     * Scheduled cleanup of expired drafts (runs daily at 2 AM)
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void cleanupExpiredDrafts() {
        log.info("Running scheduled cleanup of expired drafts...");
        LocalDateTime now = LocalDateTime.now();
        List<OrderDraft> expiredDrafts = draftRepository.findByExpiresAtBefore(now);
        
        if (!expiredDrafts.isEmpty()) {
            log.info("Found {} expired drafts to delete", expiredDrafts.size());
            draftRepository.deleteByExpiresAtBefore(now);
            log.info("Cleanup completed");
        } else {
            log.info("No expired drafts found");
        }
    }

    /**
     * Convert draft to order (when user clicks submit)
     * Returns the draft data for order creation
     */
    public OrderDraft convertDraftToOrder(String draftId) {
        OrderDraft draft = getDraft(draftId);
        
        if (!draft.getIsComplete()) {
            throw new RuntimeException("Draft is not complete. Please finish all steps.");
        }

        // Draft will be deleted after successful order creation
        return draft;
    }

    /**
     * Upload document for draft (immediate upload)
     * Stores file and updates draft with document URL
     */
    @Transactional
    public Map<String, Object> uploadDraftDocument(String draftId, org.springframework.web.multipart.MultipartFile file, String documentType) {
        try {
            log.info("Processing draft document upload for draft: {}", draftId);
            
            // Verify draft exists
            OrderDraft draft = getDraft(draftId);
            
            // Generate filename: draft_{draftId}_{timestamp}_{originalName}
            String timestamp = String.valueOf(System.currentTimeMillis());
            String originalFilename = file.getOriginalFilename();
            String filename = String.format("draft_%s_%s_%s", draftId, timestamp, originalFilename);
            
            // Define upload directory
            java.nio.file.Path uploadDir = java.nio.file.Paths.get("/home/ubuntu/uploads/documents");
            if (!java.nio.file.Files.exists(uploadDir)) {
                java.nio.file.Files.createDirectories(uploadDir);
            }
            
            // Save file
            java.nio.file.Path filePath = uploadDir.resolve(filename);
            file.transferTo(filePath.toFile());
            
            log.info("Draft document saved to: {}", filePath);
            
            // Generate document URL (relative path for storage)
            String documentUrl = "/uploads/documents/" + filename;
            
            // Update draft's documentsData JSON array
            String currentDocumentsData = draft.getDocumentsData();
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            java.util.List<Map<String, Object>> documents;
            
            if (currentDocumentsData == null || currentDocumentsData.isEmpty()) {
                documents = new java.util.ArrayList<>();
            } else {
                documents = mapper.readValue(currentDocumentsData, 
                    new com.fasterxml.jackson.core.type.TypeReference<java.util.List<Map<String, Object>>>() {});
            }
            
            // Add new document to list
            Map<String, Object> newDocument = new java.util.HashMap<>();
            newDocument.put("url", documentUrl);
            newDocument.put("filename", originalFilename);
            newDocument.put("fileSize", file.getSize());
            newDocument.put("documentType", documentType);
            newDocument.put("uploadedAt", LocalDateTime.now().toString());
            documents.add(newDocument);
            
            // Save updated JSON back to draft
            draft.setDocumentsData(mapper.writeValueAsString(documents));
            draftRepository.save(draft);
            
            log.info("Draft updated with document URL: {}", documentUrl);
            
            return newDocument;
        } catch (Exception e) {
            log.error("Failed to upload draft document: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload document: " + e.getMessage());
        }
    }
}
