package com.processserve.order.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * DTO for saving/updating drafts.
 * All fields are optional - accepts partial data!
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DraftRequest {

    private String draftId; // null for new draft, ID for update
    private String customerId;
    private String tenantId;
    private Integer currentStep;

    // Flexible JSON data - no validation!
    private Map<String, Object> documentData;
    private Map<String, Object> recipientsData;
    private Map<String, Object> serviceOptionsData;
}
