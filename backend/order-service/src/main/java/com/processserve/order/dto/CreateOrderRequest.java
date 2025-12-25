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

    @NotNull(message = "At least one dropoff is required")
    private List<DropoffRequest> dropoffs = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DropoffRequest {
        @NotBlank(message = "Recipient name is required")
        private String recipientName;

        @NotBlank(message = "Dropoff address is required")
        private String dropoffAddress;

        @NotBlank(message = "Dropoff ZIP code is required")
        private String dropoffZipCode;

        private String dropoffType; // GUIDED or AUTOMATED
        private String assignedProcessServerId;
        private java.math.BigDecimal finalAgreedPrice; // Payout to Process Server
        private java.math.BigDecimal customerPrice; // Price customer pays (for Concierge)

        // Pricing options
        private Boolean rushService = false;
        private Boolean remoteLocation = false;

        // Requirement 3: Order Type Selection (Per Dropoff)
        private String serviceType; // PROCESS_SERVICE or CERTIFIED_MAIL
    }
}
