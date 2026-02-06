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

    private String customName; // Customer-provided order name

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

    // Initiator/Attorney Information ("Who Are You" section)
    private String initiatorType; // SELF_REPRESENTED or ATTORNEY
    private String initiatorFirstName;
    private String initiatorMiddleName;
    private String initiatorLastName;
    private String initiatorAddress;
    private String initiatorCity;
    private String initiatorState;
    private String initiatorZipCode;
    private String initiatorPhone;

    // Document Service Dates
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime hearingDate;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime personalServiceDate;

    private String status; // OPEN, BIDDING, etc.

    @NotNull(message = "At least one recipient is required")
    private List<RecipientRequest> recipients = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecipientRequest {
        // Recipient Entity Type
        private String recipientEntityType; // INDIVIDUAL or ORGANIZATION

        // Individual recipient fields
        private String firstName;
        private String middleName;
        private String lastName;

        // Organization recipient fields
        private String organizationName;
        private String authorizedAgent;

        // Contact information
        private String email;
        private String phone;

        // Legacy field for backward compatibility
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

        // Service options
        private Boolean processService = false;
        private Boolean certifiedMail = false;
        private Boolean rushService = false;
        private Boolean remoteLocation = false;

        // Requirement 3: Order Type Selection (Per Recipient)
        private String serviceType; // PROCESS_SERVICE or CERTIFIED_MAIL
    }
}
