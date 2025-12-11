package com.processserve.user.service;

import com.processserve.user.entity.ProcessServerProfile;
import com.processserve.user.entity.Rating;
import com.processserve.user.repository.ProcessServerRepository;
import com.processserve.user.repository.RatingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProcessServerService {

    private final ProcessServerRepository processServerRepository;
    private final RatingRepository ratingRepository;

    @Transactional
    public ProcessServerProfile createProfile(String tenantUserRoleId, String operatingZipCodes, String tenantId,
            boolean isGlobal) {
        ProcessServerProfile profile = new ProcessServerProfile();
        profile.setId(UUID.randomUUID().toString());
        profile.setTenantUserRoleId(tenantUserRoleId);
        profile.setOperatingZipCodes(operatingZipCodes);
        profile.setTenantId(tenantId);
        profile.setIsGlobal(isGlobal);
        profile.setStatus(ProcessServerProfile.ProcessServerStatus.PENDING_APPROVAL);
        profile.setIsRedZone(false);

        return processServerRepository.save(profile);
    }

    public List<ProcessServerProfile> getGlobalProcessServers() {
        return processServerRepository.findByIsGlobal(true);
    }

    public List<ProcessServerProfile> getTenantProcessServers(String tenantId, String filterType) {
        if ("GLOBAL".equalsIgnoreCase(filterType)) {
            return processServerRepository.findByIsGlobal(true);
        } else if ("MANUAL".equalsIgnoreCase(filterType)) {
            return processServerRepository.findByTenantIdAndIsGlobal(tenantId, false);
        } else {
            // ALL: Union of Global and Tenant Specific
            List<ProcessServerProfile> global = processServerRepository.findByIsGlobal(true);
            List<ProcessServerProfile> tenantSpecific = processServerRepository.findByTenantId(tenantId);
            // Combine and deduplicate if necessary (though IDs should be unique)
            // Actually, just returning both lists combined
            global.addAll(tenantSpecific);
            return global.stream().distinct().toList();
        }
    }

    @Transactional
    public void updateStats(String tenantUserRoleId, boolean successful, int attemptCount) {
        ProcessServerProfile profile = processServerRepository.findByTenantUserRoleId(tenantUserRoleId)
                .orElseThrow(() -> new RuntimeException("Process server profile not found"));

        if (successful) {
            profile.setSuccessfulDeliveries(profile.getSuccessfulDeliveries() + 1);
        } else {
            // Logic for failed deliveries? Entity has failedAfterMaxAttempts.
            // Assuming "successful" false means a failed attempt or failed delivery?
            // The original code incremented failedDeliveries.
            // My new entity has failedAfterMaxAttempts. I'll use that if it's a final
            // failure.
            // But updateStats might be called per attempt?
            // "failed_deliveries" was in old entity. New entity has
            // "failed_after_max_attempts".
            // I'll assume this method is called when a delivery is final.
            profile.setFailedAfterMaxAttempts(profile.getFailedAfterMaxAttempts() + 1);
        }

        // Update total attempts?
        // The original code didn't update total attempts here, but maybe I should?
        // New entity has totalAttempts.
        profile.setTotalAttempts(profile.getTotalAttempts() + attemptCount);

        processServerRepository.save(profile);
        log.info("Updated stats for process server {}", tenantUserRoleId);
    }

    @Transactional
    public void setRedZone(String tenantUserRoleId, boolean isRedZone) {
        ProcessServerProfile profile = processServerRepository.findByTenantUserRoleId(tenantUserRoleId)
                .orElseThrow(() -> new RuntimeException("Process server profile not found"));

        profile.setIsRedZone(isRedZone);
        processServerRepository.save(profile);

        log.warn("Red zone status for {} set to: {}", tenantUserRoleId, isRedZone);
    }

    private final com.processserve.user.client.OrderClient orderClient;

    @Transactional
    public void addRating(String orderId, String customerId, String processServerId,
            int ratingValue, String reviewText) {

        // Validate eligibility via Order Service
        boolean isEligible = orderClient.validateRatingEligibility(orderId, customerId, processServerId);
        if (!isEligible) {
            throw new RuntimeException("Rating not allowed: No completed order found matching these details.");
        }

        // Create rating
        Rating rating = new Rating();
        rating.setId(UUID.randomUUID().toString());
        rating.setOrderId(orderId);
        rating.setCustomerId(customerId);
        rating.setProcessServerId(processServerId);
        rating.setRatingValue(ratingValue);
        rating.setReviewText(reviewText);

        ratingRepository.save(rating);

        ProcessServerProfile profile = processServerRepository.findById(processServerId)
                .orElseThrow(() -> new RuntimeException("Process server not found"));

        List<Rating> allRatings = ratingRepository.findByProcessServerId(processServerId);

        double avgRating = allRatings.stream()
                .mapToInt(Rating::getRatingValue)
                .average()
                .orElse(0.0);

        profile.setCurrentRating(BigDecimal.valueOf(avgRating).setScale(2, RoundingMode.HALF_UP));

        processServerRepository.save(profile);

        log.info("Rating added for process server {}. New average: {}", processServerId, avgRating);
    }

    public ProcessServerProfile getProfile(String idOrTenantUserRoleId) {
        log.info("Looking up profile for ID/TenantUserRoleId: {}", idOrTenantUserRoleId);
        
        // Try finding by ID (PK) first
        return processServerRepository.findById(idOrTenantUserRoleId)
                .or(() -> processServerRepository.findByTenantUserRoleId(idOrTenantUserRoleId))
                .orElseThrow(() -> {
                    log.error("Profile not found for ID/TenantUserRoleId: {}", idOrTenantUserRoleId);
                    return new RuntimeException("Profile not found for ID: " + idOrTenantUserRoleId);
                });
    }

    public List<ProcessServerProfile> getPendingApprovals() {
        return processServerRepository.findByStatus(ProcessServerProfile.ProcessServerStatus.PENDING_APPROVAL);
    }

    public List<ProcessServerProfile> getAllProcessServers() {
        return processServerRepository.findAll();
    }
}
