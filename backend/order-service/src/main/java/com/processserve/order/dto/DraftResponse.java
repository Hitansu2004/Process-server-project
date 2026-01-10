package com.processserve.order.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * DTO for returning draft data to frontend
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DraftResponse {

    private String id;
    private String customerId;
    private String tenantId;
    private String draftName;
    private Integer currentStep;
    private Boolean isComplete;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime expiresAt;

    // Draft content
    private Map<String, Object> documentData;
    private Map<String, Object> recipientsData;
    private Map<String, Object> serviceOptionsData;
}
