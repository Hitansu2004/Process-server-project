package com.processserve.order.service;

import com.processserve.order.model.OrderDraft;
import com.processserve.order.model.OrderDraftData;
import com.processserve.order.repository.OrderDraftRepository;
import com.processserve.order.repository.OrderDraftDataRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Service for managing order drafts.
 * Provides simple save/load/delete operations with NO validation.
 */
@Service
@Slf4j
public class DraftService {

    @Autowired
    private OrderDraftRepository draftRepository;

    @Autowired
    private OrderDraftDataRepository draftDataRepository;

    /**
     * Save or update a draft. Creates new draft if draftId is null.
     * NO VALIDATION - accepts any data!
     */
    @Transactional
    public OrderDraft saveDraft(
            String draftId,
            String customerId,
            String tenantId,
            Integer currentStep,
            Map<String, Object> documentData,
            Map<String, Object> recipientsData,
            Map<String, Object> serviceOptionsData) {
        log.info("Saving draft for customer: {}, draftId: {}", customerId, draftId);

        OrderDraft draft;
        OrderDraftData draftData;

        if (draftId != null) {
            // Update existing draft
            draft = draftRepository.findById(draftId)
                    .orElseThrow(() -> new RuntimeException("Draft not found: " + draftId));

            draftData = draft.getDraftData();
            if (draftData == null) {
                draftData = new OrderDraftData();
                draftData.setId(UUID.randomUUID().toString());
                draftData.setDraft(draft);
            }
        } else {
            // Create new draft
            draft = new OrderDraft();
            draft.setId(UUID.randomUUID().toString());
            draft.setCustomerId(customerId);
            draft.setTenantId(tenantId);
            draft.setDraftName("Draft Order");

            draftData = new OrderDraftData();
            draftData.setId(UUID.randomUUID().toString());
            draftData.setDraft(draft);
            draft.setDraftData(draftData);
        }

        // Update step
        if (currentStep != null) {
            draft.setCurrentStep(currentStep);
        }

        // Update data (NO VALIDATION!)
        if (documentData != null) {
            draftData.setDocumentData(documentData);
        }
        if (recipientsData != null) {
            draftData.setRecipientsData(recipientsData);
        }
        if (serviceOptionsData != null) {
            draftData.setServiceOptionsData(serviceOptionsData);
        }

        // Check if draft is complete (all steps have data)
        boolean isComplete = draftData.getDocumentData() != null &&
                !draftData.getDocumentData().isEmpty() &&
                draftData.getRecipientsData() != null &&
                !draftData.getRecipientsData().isEmpty();
        draft.setIsComplete(isComplete);

        OrderDraft savedDraft = draftRepository.save(draft);
        log.info("Draft saved successfully: {}", savedDraft.getId());

        return savedDraft;
    }

    /**
     * Get a specific draft by ID
     */
    public OrderDraft getDraft(String draftId) {
        log.info("Loading draft: {}", draftId);
        return draftRepository.findById(draftId)
                .orElseThrow(() -> new RuntimeException("Draft not found: " + draftId));
    }

    /**
     * Get all drafts for a customer
     */
    public List<OrderDraft> getCustomerDrafts(String customerId) {
        log.info("Loading drafts for customer: {}", customerId);
        return draftRepository.findByCustomerIdOrderByUpdatedAtDesc(customerId);
    }

    /**
     * Get the most recent draft for a customer
     */
    public OrderDraft getLatestDraft(String customerId) {
        log.info("Loading latest draft for customer: {}", customerId);
        return draftRepository.findFirstByCustomerIdOrderByUpdatedAtDesc(customerId)
                .orElse(null);
    }

    /**
     * Delete a draft
     */
    @Transactional
    public void deleteDraft(String draftId) {
        log.info("Deleting draft: {}", draftId);
        OrderDraft draft = getDraft(draftId);
        draftRepository.delete(draft);
        log.info("Draft deleted successfully: {}", draftId);
    }

    /**
     * Delete all drafts for a customer
     */
    @Transactional
    public void deleteCustomerDrafts(String customerId) {
        log.info("Deleting all drafts for customer: {}", customerId);
        draftRepository.deleteByCustomerId(customerId);
    }

    /**
     * Clean up expired drafts (should be run periodically)
     */
    @Transactional
    public int cleanupExpiredDrafts() {
        log.info("Cleaning up expired drafts");
        List<OrderDraft> expiredDrafts = draftRepository.findExpiredDrafts(LocalDateTime.now());
        int count = expiredDrafts.size();
        draftRepository.deleteAll(expiredDrafts);
        log.info("Deleted {} expired drafts", count);
        return count;
    }
}
