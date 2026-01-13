package com.processserve.order.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProposePriceRequest {
    private String orderRecipientId;
    private BigDecimal proposedAmount;
    private String notes;
}
