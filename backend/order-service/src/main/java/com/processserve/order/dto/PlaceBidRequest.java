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
public class PlaceBidRequest {

    @NotBlank(message = "Order Dropoff ID is required")
    private String orderDropoffId;

    @NotBlank(message = "Process Server ID is required")
    private String processServerId;

    @NotNull(message = "Bid amount is required")
    private BigDecimal bidAmount;

    private String comment;
}
