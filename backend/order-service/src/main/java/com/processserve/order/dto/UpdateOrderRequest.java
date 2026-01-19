package com.processserve.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOrderRequest {

    @NotBlank(message = "Order ID is required")
    private String orderId;

    private String specialInstructions;

    private LocalDateTime deadline;

    private String orderType; // PROCESS_SERVICE or CERTIFIED_MAIL

    private String documentType;

    private String otherDocumentType;

    private String caseNumber;

    private String jurisdiction;

    @Valid
    private List<RecipientUpdate> recipientUpdates;

    private String modificationReason; // Optional reason for the update

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecipientUpdate {
        private String recipientId; // If updating existing recipient

        @NotBlank(message = "Recipient name is required")
        private String recipientName;

        @NotBlank(message = "Recipient address is required")
        private String recipientAddress;

        @NotBlank(message = "Zip code is required")
        private String recipientZipCode;

        private String city; // Added for completeness

        private String state; // Added for completeness

        private String recipientType; // AUTOMATED or GUIDED

        private String assignedProcessServerId; // For GUIDED type

        private Boolean rushService; // Req 2

        private Boolean remoteLocation; // Req 2

        private Boolean processService; // Added for service options

        private Boolean certifiedMail; // Added for service options

        private boolean isNew; // Flag to indicate this is a new recipient being added

        private boolean toBeRemoved; // Flag to mark for deletion

        private String serviceType; // PROCESS_SERVICE or CERTIFIED_MAIL
    }
}
