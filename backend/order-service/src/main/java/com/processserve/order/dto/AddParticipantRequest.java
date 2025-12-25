package com.processserve.order.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddParticipantRequest {
    private String orderId;
    private String userId;
    private String userRole; // CUSTOMER, ADMIN, SERVER
}
