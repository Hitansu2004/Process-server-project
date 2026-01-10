package com.processserve.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecordAttemptRequest {

    @NotBlank(message = "Recipient ID is required")
    private String recipientId;

    @NotBlank(message = "Process Server ID is required")
    private String processServerId;

    @NotNull(message = "Success status is required")
    private Boolean wasSuccessful;

    private String outcomeNotes;

    @NotNull(message = "GPS latitude is required")
    private BigDecimal gpsLatitude;

    @NotNull(message = "GPS longitude is required")
    private BigDecimal gpsLongitude;

    private String photoProofUrl;
}
