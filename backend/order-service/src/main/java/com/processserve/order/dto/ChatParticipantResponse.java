package com.processserve.order.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatParticipantResponse {
    private String id;
    private String orderId;
    private String userId;
    private String userRole;
    private Boolean isActive;
    private String addedByUserId;
    private LocalDateTime addedAt;
    private LocalDateTime removedAt;
}
