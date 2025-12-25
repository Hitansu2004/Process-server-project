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

    private String caseNumber;

    private String jurisdiction;

    @Valid
    private List<DropoffUpdate> dropoffUpdates;

    private String modificationReason; // Optional reason for the update

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DropoffUpdate {
        private String dropoffId; // If updating existing dropoff

        @NotBlank(message = "Recipient name is required")
        private String recipientName;

        @NotBlank(message = "Dropoff address is required")
        private String dropoffAddress;

        @NotBlank(message = "Zip code is required")
        private String dropoffZipCode;

        private String dropoffType; // AUTOMATED or GUIDED

        private String assignedProcessServerId; // For GUIDED type

        private Double finalAgreedPrice;

        private Boolean rushService; // Req 2

        private Boolean remoteLocation; // Req 2

        private boolean isNew; // Flag to indicate this is a new dropoff being added

        private boolean toBeRemoved; // Flag to mark for deletion
    }
}
