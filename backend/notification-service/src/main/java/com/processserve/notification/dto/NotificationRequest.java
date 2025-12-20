package com.processserve.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {
    private String tenantId;
    private String userId;
    private String type;
    private String title;
    private String message;
    private String relatedOrderId;
}
