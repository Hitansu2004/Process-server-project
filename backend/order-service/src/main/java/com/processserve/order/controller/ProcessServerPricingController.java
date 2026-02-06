package com.processserve.order.controller;

import com.processserve.order.entity.ProcessServerPricing;
import com.processserve.order.service.ProcessServerPricingService;
import com.processserve.order.service.ProcessServerPricingService.CalculatedPricing;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for managing process server custom pricing.
 * 
 * Endpoints:
 * - GET /{processServerId} - Get all pricing rules
 * - POST /{processServerId}/calculate - Calculate fees for selected options
 * - POST / - Create single pricing rule
 * - PUT /{pricingId} - Update pricing rule
 * - POST /batch - Create multiple rules
 * - DELETE /{pricingId} - Delete pricing rule
 */
@RestController
@RequestMapping("/api/process-servers/pricing")
@RequiredArgsConstructor
@Slf4j
public class ProcessServerPricingController {

    private final ProcessServerPricingService pricingService;

    /**
     * Get all pricing rules for a process server
     */
    @GetMapping("/{processServerId}")
    public ResponseEntity<PricingResponse> getAllPricing(@PathVariable String processServerId) {
        try {
            log.info("==== FETCHING PRICING FOR PROCESS SERVER ====");
            log.info("Process Server ID: {}", processServerId);
            
            List<ProcessServerPricing> allPricing = pricingService.getAllPricing(processServerId);
            
            log.info("==== PRICING ENTRIES FOUND: {} ====", allPricing.size());
            for (ProcessServerPricing pricing : allPricing) {
                log.info("Entry ID: {}, ZipCode: {}, ProcessFee: {}, CertifiedFee: {}, RushFee: {}, RemoteFee: {}", 
                    pricing.getPricingId(),
                    pricing.getZipCode(),
                    pricing.getProcessServiceFee(),
                    pricing.getCertifiedMailFee(),
                    pricing.getRushServiceFee(),
                    pricing.getRemoteServiceFee());
            }
            
            PricingResponse response = new PricingResponse();
            response.setProcessServerId(processServerId);
            response.setAllPricing(allPricing);
            response.setHasCustomPricing(pricingService.hasCustomPricing(processServerId));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to get pricing for process server {}: {}", processServerId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Calculate service options fee for specific zip code and selected options
     */
    @PostMapping("/{processServerId}/calculate")
    public ResponseEntity<?> calculatePricing(
            @PathVariable String processServerId,
            @Valid @RequestBody CalculatePricingRequest request) {
        try {
            log.info("Calculating pricing for PS: {}, ZipCode: {}, Options: ProcessService={}, CertifiedMail={}, Rush={}, Remote={}",
                processServerId, request.getZipCode(),
                request.isProcessService(), request.isCertifiedMail(),
                request.isRush(), request.isRemote());

            CalculatedPricing pricing = pricingService.calculateServiceOptions(
                processServerId,
                request.getZipCode(),
                request.isProcessService(),
                request.isCertifiedMail(),
                request.isRush(),
                request.isRemote()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("processServerId", processServerId);
            response.put("zipCode", request.getZipCode());
            response.put("appliedZipCode", pricing.getAppliedZipCode());
            response.put("processServiceFee", pricing.getProcessServiceFee());
            response.put("certifiedMailFee", pricing.getCertifiedMailFee());
            response.put("rushServiceFee", pricing.getRushServiceFee());
            response.put("remoteServiceFee", pricing.getRemoteServiceFee());
            response.put("totalServiceOptionsFee", pricing.getTotalServiceOptionsFee());
            response.put("isCustomPricing", pricing.isCustomPricing());
            response.put("usedDefaultFallback", pricing.isUsedDefaultFallback());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to calculate pricing: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Create a new pricing rule
     */
    @PostMapping
    public ResponseEntity<?> createPricing(@Valid @RequestBody PricingRequest request) {
        try {
            log.info("==== PRICING SAVE REQUEST ====");
            log.info("Process Server ID: {}", request.getProcessServerId());
            log.info("Zip Code: {}", request.getZipCode());
            log.info("Process Service Fee: {}", request.getProcessServiceFee());
            log.info("Certified Mail Fee: {}", request.getCertifiedMailFee());
            log.info("Rush Service Fee: {}", request.getRushServiceFee());
            log.info("Remote Service Fee: {}", request.getRemoteServiceFee());
            log.info("Included Copies: {}", request.getIncludedCopies());
            log.info("Per Page Print Fee: {}", request.getPerPagePrintFee());
            
            ProcessServerPricing pricing = new ProcessServerPricing();
            pricing.setProcessServerId(request.getProcessServerId());
            pricing.setIncludedCopies(request.getIncludedCopies());
            pricing.setPerPagePrintFee(request.getPerPagePrintFee());
            pricing.setZipCode(request.getZipCode());
            pricing.setProcessServiceFee(request.getProcessServiceFee());
            pricing.setCertifiedMailFee(request.getCertifiedMailFee());
            pricing.setRushServiceFee(request.getRushServiceFee());
            pricing.setRemoteServiceFee(request.getRemoteServiceFee());
            pricing.setIsActive(true);

            ProcessServerPricing saved = pricingService.savePricing(pricing);
            
            log.info("==== PRICING SAVED TO DATABASE ====");
            log.info("Saved ID: {}", saved.getPricingId());
            log.info("Saved Process Service Fee: {}", saved.getProcessServiceFee());
            log.info("Saved Certified Mail Fee: {}", saved.getCertifiedMailFee());
            log.info("Saved Rush Service Fee: {}", saved.getRushServiceFee());
            log.info("Saved Remote Service Fee: {}", saved.getRemoteServiceFee());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            log.error("Failed to create pricing: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Update an existing pricing rule
     */
    @PutMapping("/{pricingId}")
    public ResponseEntity<?> updatePricing(
            @PathVariable String pricingId,
            @Valid @RequestBody PricingRequest request) {
        try {
            ProcessServerPricing pricing = new ProcessServerPricing();
            pricing.setPricingId(pricingId);
            pricing.setProcessServerId(request.getProcessServerId());
            pricing.setIncludedCopies(request.getIncludedCopies());
            pricing.setPerPagePrintFee(request.getPerPagePrintFee());
            pricing.setZipCode(request.getZipCode());
            pricing.setProcessServiceFee(request.getProcessServiceFee());
            pricing.setCertifiedMailFee(request.getCertifiedMailFee());
            pricing.setRushServiceFee(request.getRushServiceFee());
            pricing.setRemoteServiceFee(request.getRemoteServiceFee());
            pricing.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

            ProcessServerPricing updated = pricingService.updatePricing(pricingId, pricing);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("Failed to update pricing: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Create multiple pricing rules at once
     */
    @PostMapping("/batch")
    public ResponseEntity<?> createPricingBatch(@Valid @RequestBody BatchPricingRequest request) {
        try {
            List<ProcessServerPricing> pricingList = request.getPricingRules().stream()
                .map(req -> {
                    ProcessServerPricing pricing = new ProcessServerPricing();
                    pricing.setProcessServerId(request.getProcessServerId());
                    pricing.setIncludedCopies(req.getIncludedCopies());
                    pricing.setPerPagePrintFee(req.getPerPagePrintFee());
                    pricing.setZipCode(req.getZipCode());
                    pricing.setProcessServiceFee(req.getProcessServiceFee());
                    pricing.setCertifiedMailFee(req.getCertifiedMailFee());
                    pricing.setRushServiceFee(req.getRushServiceFee());
                    pricing.setRemoteServiceFee(req.getRemoteServiceFee());
                    pricing.setIsActive(true);
                    return pricing;
                })
                .toList();

            List<ProcessServerPricing> saved = pricingService.savePricingBatch(pricingList);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            log.error("Failed to create pricing batch: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Delete a pricing rule (soft delete)
     */
    @DeleteMapping("/{pricingId}")
    public ResponseEntity<?> deletePricing(@PathVariable String pricingId) {
        try {
            pricingService.deletePricing(pricingId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Pricing rule deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to delete pricing: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Delete all pricing for a process server (soft delete)
     */
    @DeleteMapping("/process-server/{processServerId}")
    public ResponseEntity<?> deleteAllPricing(@PathVariable String processServerId) {
        try {
            pricingService.deleteAllPricingForProcessServer(processServerId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "All pricing rules deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to delete all pricing: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // DTOs
    @Data
    public static class PricingRequest {
        private String processServerId;
        private Integer includedCopies;
        private BigDecimal perPagePrintFee;
        private String zipCode;
        private BigDecimal processServiceFee;
        private BigDecimal certifiedMailFee;
        private BigDecimal rushServiceFee;
        private BigDecimal remoteServiceFee;
        private Boolean isActive;
    }

    @Data
    public static class BatchPricingRequest {
        private String processServerId;
        private List<PricingRequest> pricingRules;
    }

    @Data
    public static class CalculatePricingRequest {
        private String zipCode;
        private boolean processService;
        private boolean certifiedMail;
        private boolean rush;
        private boolean remote;
    }

    @Data
    public static class PricingResponse {
        private String processServerId;
        private List<ProcessServerPricing> allPricing;
        private boolean hasCustomPricing;
    }
}
