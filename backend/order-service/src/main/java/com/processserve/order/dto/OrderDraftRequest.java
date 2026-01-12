package com.processserve.order.dto;

import lombok.Data;

@Data
public class OrderDraftRequest {
    private String tenantId;
    private String customerId;
    private String draftName;
    private Integer currentStep;
    private Boolean isComplete;
    private String documentData;    // JSON string
    private String recipientsData;  // JSON string
    private String serviceOptionsData; // JSON string
}
