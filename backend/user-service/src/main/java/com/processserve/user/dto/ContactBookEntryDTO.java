package com.processserve.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactBookEntryDTO {
    private String id;
    private String processServerId;
    private String nickname;
    private String entryType;
    private String activationStatus;
    private String invitationId;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;

    // Process server details (if activated)
    private ProcessServerDetailsDTO processServerDetails;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProcessServerDetailsDTO {
        private String id;
        private String name;
        private String profilePhotoUrl;
        private Double currentRating;
        private Double successRate;
        private Integer totalOrdersAssigned;
        private Integer successfulDeliveries;
    }
}
