package com.processserve.order.service;

import com.processserve.order.entity.ProcessServerPricing;
import com.processserve.order.repository.ProcessServerPricingRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Service for managing process server custom pricing.
 * 
 * Pricing Logic:
 * - Each process server has one row per zip code containing all 4 service fees
 * - Process Service & Certified Mail fees are FIXED per PS (same across all zips)
 * - Rush & Remote fees can VARY by zip code
 * - zip_code='ALL' is the default fallback
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ProcessServerPricingService {

    private final ProcessServerPricingRepository pricingRepository;

    /**
     * Get all pricing rules for a process server
     */
    public List<ProcessServerPricing> getAllPricing(String processServerId) {
        return pricingRepository.findByProcessServerIdAndIsActiveTrue(processServerId);
    }

    /**
     * Get pricing for a specific zip code with fallback to default
     */
    public ProcessServerPricing getPricingForZipCode(String processServerId, String zipCode) {
        log.debug("Looking up pricing for PS: {}, ZipCode: {}", processServerId, zipCode);

        // Try exact zip code match first
        Optional<ProcessServerPricing> exactMatch = pricingRepository
            .findByProcessServerIdAndZipCodeAndIsActiveTrue(processServerId, zipCode);

        if (exactMatch.isPresent()) {
            log.debug("Found exact zip code match: {}", zipCode);
            return exactMatch.get();
        }

        // Fall back to default pricing (zip_code='ALL')
        Optional<ProcessServerPricing> defaultPricing = pricingRepository.findDefaultPricing(processServerId);

        if (defaultPricing.isPresent()) {
            log.debug("Using default pricing (zip='ALL') for PS: {}", processServerId);
            return defaultPricing.get();
        }

        // No custom pricing exists - return hardcoded defaults
        log.warn("No pricing found for PS: {}. Using hardcoded defaults.", processServerId);
        return createDefaultPricing(processServerId);
    }

    /**
     * Calculate service options fee based on selected options
     */
    public CalculatedPricing calculateServiceOptions(
        String processServerId,
        String zipCode,
        boolean isProcessService,
        boolean isCertifiedMail,
        boolean isRush,
        boolean isRemote
    ) {
        CalculatedPricing result = new CalculatedPricing();
        BigDecimal totalFee = BigDecimal.ZERO;

        // Get pricing row for this zip code (or default)
        ProcessServerPricing pricing = getPricingForZipCode(processServerId, zipCode);

        result.setAppliedZipCode(pricing.getZipCode());
        result.setUsedDefaultFallback(pricing.isDefault());
        result.setCustomPricing(!pricing.getIsActive().equals(false)); // false means it's our hardcoded default

        // Add selected service fees
        if (isProcessService && pricing.getProcessServiceFee() != null) {
            result.setProcessServiceFee(pricing.getProcessServiceFee());
            totalFee = totalFee.add(pricing.getProcessServiceFee());
        }

        if (isCertifiedMail && pricing.getCertifiedMailFee() != null) {
            result.setCertifiedMailFee(pricing.getCertifiedMailFee());
            totalFee = totalFee.add(pricing.getCertifiedMailFee());
        }

        if (isRush && pricing.getRushServiceFee() != null) {
            result.setRushServiceFee(pricing.getRushServiceFee());
            totalFee = totalFee.add(pricing.getRushServiceFee());
        }

        if (isRemote && pricing.getRemoteServiceFee() != null) {
            result.setRemoteServiceFee(pricing.getRemoteServiceFee());
            totalFee = totalFee.add(pricing.getRemoteServiceFee());
        }

        result.setTotalServiceOptionsFee(totalFee);
        return result;
    }

    /**
     * Create or update pricing rule
     */
    @Transactional
    public ProcessServerPricing savePricing(ProcessServerPricing pricing) {
        log.info("Saving pricing for PS: {}, ZipCode: {}",
            pricing.getProcessServerId(), pricing.getZipCode());

        // If this is a DEFAULT pricing (zipCode='ALL'), delete ALL existing DEFAULT pricing entries
        if ("ALL".equalsIgnoreCase(pricing.getZipCode())) {
            List<ProcessServerPricing> existingDefaults = pricingRepository
                .findByProcessServerIdAndIsActiveTrue(pricing.getProcessServerId())
                .stream()
                .filter(p -> "ALL".equalsIgnoreCase(p.getZipCode()))
                .toList();
            
            if (!existingDefaults.isEmpty()) {
                log.info("Found {} existing DEFAULT pricing entries. Deleting them before creating new DEFAULT.", 
                    existingDefaults.size());
                pricingRepository.deleteAll(existingDefaults);
            }
        }

        return pricingRepository.save(pricing);
    }

    /**
     * Create multiple pricing rules at once
     */
    @Transactional
    public List<ProcessServerPricing> savePricingBatch(List<ProcessServerPricing> pricingList) {
        log.info("Batch saving {} pricing rules", pricingList.size());
        return pricingRepository.saveAll(pricingList);
    }

    /**
     * Update existing pricing rule
     */
    @Transactional
    public ProcessServerPricing updatePricing(String pricingId, ProcessServerPricing updatedPricing) {
        Optional<ProcessServerPricing> existing = pricingRepository.findById(pricingId);
        
        if (existing.isEmpty()) {
            throw new IllegalArgumentException("Pricing rule not found: " + pricingId);
        }

        ProcessServerPricing pricing = existing.get();
        pricing.setZipCode(updatedPricing.getZipCode());
        pricing.setProcessServiceFee(updatedPricing.getProcessServiceFee());
        pricing.setCertifiedMailFee(updatedPricing.getCertifiedMailFee());
        pricing.setRushServiceFee(updatedPricing.getRushServiceFee());
        pricing.setRemoteServiceFee(updatedPricing.getRemoteServiceFee());
        pricing.setIncludedCopies(updatedPricing.getIncludedCopies());
        pricing.setPerPagePrintFee(updatedPricing.getPerPagePrintFee());

        return pricingRepository.save(pricing);
    }

    /**
     * Delete a pricing rule (soft delete by setting isActive=false)
     */
    @Transactional
    public void deletePricing(String pricingId) {
        log.info("Deleting pricing rule: {}", pricingId);
        Optional<ProcessServerPricing> pricing = pricingRepository.findById(pricingId);
        
        if (pricing.isPresent()) {
            ProcessServerPricing p = pricing.get();
            p.setIsActive(false);
            pricingRepository.save(p);
        }
    }

    /**
     * Delete all pricing for a process server
     */
    @Transactional
    public void deleteAllPricingForProcessServer(String processServerId) {
        log.info("Deleting all pricing for PS: {}", processServerId);
        List<ProcessServerPricing> allPricing = pricingRepository.findByProcessServerId(processServerId);
        
        for (ProcessServerPricing pricing : allPricing) {
            pricing.setIsActive(false);
        }
        
        pricingRepository.saveAll(allPricing);
    }

    /**
     * Check if process server has custom pricing
     */
    public boolean hasCustomPricing(String processServerId) {
        return pricingRepository.existsByProcessServerIdAndIsActiveTrue(processServerId);
    }

    /**
     * Create default hardcoded pricing when no custom pricing exists
     */
    private ProcessServerPricing createDefaultPricing(String processServerId) {
        ProcessServerPricing pricing = new ProcessServerPricing();
        pricing.setProcessServerId(processServerId);
        pricing.setZipCode("ALL");
        pricing.setIncludedCopies(25);
        pricing.setPerPagePrintFee(new BigDecimal("0.25"));
        pricing.setProcessServiceFee(new BigDecimal("50.00"));
        pricing.setCertifiedMailFee(new BigDecimal("50.00"));
        pricing.setRushServiceFee(new BigDecimal("50.00"));
        pricing.setRemoteServiceFee(new BigDecimal("30.00"));
        pricing.setIsActive(false); // Not saved, just used for calculation

        return pricing;
    }

    /**
     * DTO for calculated pricing
     */
    @Data
    public static class CalculatedPricing {
        private BigDecimal processServiceFee = BigDecimal.ZERO;
        private BigDecimal certifiedMailFee = BigDecimal.ZERO;
        private BigDecimal rushServiceFee = BigDecimal.ZERO;
        private BigDecimal remoteServiceFee = BigDecimal.ZERO;
        private BigDecimal totalServiceOptionsFee = BigDecimal.ZERO;

        // Additional info
        private String appliedZipCode;
        private boolean isCustomPricing;
        private boolean usedDefaultFallback;
    }
}
