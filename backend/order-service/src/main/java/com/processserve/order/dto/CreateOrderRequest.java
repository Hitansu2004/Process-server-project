package com.processserve.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonFormat;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {

    @NotBlank(message = "Tenant ID is required")
    private String tenantId;

    @NotBlank(message = "Customer ID is required")
    private String customerId;

    private String specialInstructions;

    @NotNull(message = "Deadline is required")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime deadline;

    // Requirement 3: Order Type Selection
    private String orderType; // PROCESS_SERVICE or CERTIFIED_MAIL

    // Requirement 4: Document Type and Case Information
    private String documentType; // Legal document category
    private String otherDocumentType; // For "OTHER" type
    private String caseNumber;
    private String jurisdiction;

    // Status for draft orders
    private String status; // DRAFT, OPEN, etc.

    @NotNull(message = "At least one recipient is required")
    private List<RecipientRequest> recipients = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecipientRequest {
        @NotBlank(message = "Recipient name is required")
        private String recipientName;

        @NotBlank(message = "Recipient address is required")
        private String recipientAddress;

        @NotBlank(message = "Recipient ZIP code is required")
        private String recipientZipCode;

        // Location details
        private String city;
        private String state;
        private String stateId;

        // Notes and instructions
        private String notes;
        private String specialInstructions;

        private String recipientType; // GUIDED or AUTOMATED
        private String assignedProcessServerId;
        private String processServerName;
        private java.math.BigDecimal finalAgreedPrice; // Payout to Process Server
        private java.math.BigDecimal customerPrice; // Price customer pays (for Concierge)
        private java.math.BigDecimal quotedPrice;
        private String priceStatus;

        // Service options
        private Boolean processService = false;
        private Boolean certifiedMail = false;
        private Boolean rushService = false;
        private Boolean remoteLocation = false;

        // Requirement 3: Order Type Selection (Per Recipient)
        private String serviceType; // PROCESS_SERVICE or CERTIFIED_MAIL
    }
}
