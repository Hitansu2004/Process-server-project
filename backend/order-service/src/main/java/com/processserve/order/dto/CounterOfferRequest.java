package com.processserve.order.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CounterOfferRequest {
    private String negotiationId;
    private BigDecimal counterOfferAmount;
    private String notes;
}
