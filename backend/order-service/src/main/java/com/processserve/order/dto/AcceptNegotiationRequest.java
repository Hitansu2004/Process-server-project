package com.processserve.order.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AcceptNegotiationRequest {
    private String negotiationId;
    private String notes;
}
