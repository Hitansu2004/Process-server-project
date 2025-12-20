package com.processserve.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationRequest {
    private String tenantId;
    private String userId;
    private String type;
    private String title;
    private String message;
    private String relatedOrderId;
}
