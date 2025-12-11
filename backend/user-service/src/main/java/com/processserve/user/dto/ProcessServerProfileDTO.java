package com.processserve.user.dto;

import com.processserve.user.entity.ProcessServerProfile;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class ProcessServerProfileDTO extends ProcessServerProfile {
    private String userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;

    public ProcessServerProfileDTO(ProcessServerProfile profile) {
        this.setId(profile.getId());
        this.setTenantUserRoleId(profile.getTenantUserRoleId());
        this.setTenantId(profile.getTenantId());
        this.setIsGlobal(profile.getIsGlobal());
        this.setOperatingZipCodes(profile.getOperatingZipCodes());
        this.setCurrentRating(profile.getCurrentRating());
        this.setTotalOrdersAssigned(profile.getTotalOrdersAssigned());
        this.setSuccessfulDeliveries(profile.getSuccessfulDeliveries());
        this.setFailedAfterMaxAttempts(profile.getFailedAfterMaxAttempts());
        this.setTotalAttempts(profile.getTotalAttempts());
        this.setAverageAttemptsPerDelivery(profile.getAverageAttemptsPerDelivery());
        this.setIsRedZone(profile.getIsRedZone());
        this.setRedZoneTriggerCount(profile.getRedZoneTriggerCount());
        this.setVerificationDocs(profile.getVerificationDocs());
        this.setStatus(profile.getStatus());
        this.setLastDeliveryAt(profile.getLastDeliveryAt());
        this.setCreatedAt(profile.getCreatedAt());
        this.setUpdatedAt(profile.getUpdatedAt());
    }
}
