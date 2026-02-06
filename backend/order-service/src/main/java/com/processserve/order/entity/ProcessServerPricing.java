package com.processserve.order.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity representing custom pricing for process server services.
 * 
 * Pricing Model:
 * - Each process server has ONE row per zip code
 * - zip_code = 'ALL' represents default pricing for unlisted zip codes
 * - Process Service & Certified Mail fees are FIXED per process server (same across all zip codes)
 * - Rush Service & Remote Service fees can VARY by zip code
 * 
 * Example:
 * PS-001 charges $50 for Process Service everywhere,
 * but Rush is $60 in zip 75022 vs $50 default
 */
@Entity
@Table(name = "process_server_pricing",
    indexes = {
        @Index(name = "idx_ps_pricing_lookup", columnList = "process_server_id,zip_code,is_active")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProcessServerPricing {

    @Id
    @Column(name = "pricing_id", length = 36)
    private String pricingId;

    @Column(name = "process_server_id", length = 50, nullable = false)
    private String processServerId;

    @Column(name = "included_copies", nullable = false)
    private Integer includedCopies = 25;

    @Column(name = "per_page_print_fee", precision = 10, scale = 2, nullable = false)
    private BigDecimal perPagePrintFee = new BigDecimal("0.25");

    @Column(name = "zip_code", length = 10, nullable = false)
    private String zipCode = "ALL";  // Default to 'ALL' for default pricing

    @Column(name = "process_service_fee", precision = 10, scale = 2, nullable = false)
    private BigDecimal processServiceFee = BigDecimal.ZERO;

    @Column(name = "certified_mail_fee", precision = 10, scale = 2, nullable = false)
    private BigDecimal certifiedMailFee = BigDecimal.ZERO;

    @Column(name = "rush_service_fee", precision = 10, scale = 2, nullable = false)
    private BigDecimal rushServiceFee = BigDecimal.ZERO;

    @Column(name = "remote_service_fee", precision = 10, scale = 2, nullable = false)
    private BigDecimal remoteServiceFee = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false, columnDefinition = "DATETIME(6)")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false, columnDefinition = "DATETIME(6)")
    private LocalDateTime updatedAt;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    /**
     * Checks if this is the default pricing (applies to all unlisted zip codes)
     */
    public boolean isDefault() {
        return "ALL".equalsIgnoreCase(this.zipCode);
    }

    /**
     * Checks if this pricing applies to the given zip code
     */
    public boolean matchesZipCode(String zipCode) {
        if (isDefault()) {
            return true; // Default pricing matches all zips
        }
        return this.zipCode != null && this.zipCode.equalsIgnoreCase(zipCode);
    }

    /**
     * Get the total service options fee for selected services
     */
    public BigDecimal calculateServiceOptionsFee(boolean processService, boolean certifiedMail, 
                                                 boolean rush, boolean remote) {
        BigDecimal total = BigDecimal.ZERO;
        
        if (processService && processServiceFee != null) {
            total = total.add(processServiceFee);
        }
        if (certifiedMail && certifiedMailFee != null) {
            total = total.add(certifiedMailFee);
        }
        if (rush && rushServiceFee != null) {
            total = total.add(rushServiceFee);
        }
        if (remote && remoteServiceFee != null) {
            total = total.add(remoteServiceFee);
        }
        
        return total;
    }

    @PrePersist
    protected void onCreate() {
        if (pricingId == null || pricingId.isEmpty()) {
            pricingId = java.util.UUID.randomUUID().toString();
        }
        if (includedCopies == null) {
            includedCopies = 25;
        }
        if (perPagePrintFee == null) {
            perPagePrintFee = new BigDecimal("0.25");
        }
        if (zipCode == null || zipCode.isEmpty()) {
            zipCode = "ALL";
        }
        if (processServiceFee == null) {
            processServiceFee = BigDecimal.ZERO;
        }
        if (certifiedMailFee == null) {
            certifiedMailFee = BigDecimal.ZERO;
        }
        if (rushServiceFee == null) {
            rushServiceFee = BigDecimal.ZERO;
        }
        if (remoteServiceFee == null) {
            remoteServiceFee = BigDecimal.ZERO;
        }
        if (isActive == null) {
            isActive = true;
        }
    }
}
