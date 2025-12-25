package com.processserve.order.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderEditabilityResponse {

    private boolean canEdit;

    private String status;

    private String lockReason;

    private int modificationCount;
}
