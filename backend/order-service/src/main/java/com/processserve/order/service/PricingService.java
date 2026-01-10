package com.processserve.order.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@Slf4j
public class PricingService {

    // Pricing configuration - these could be moved to tenant configuration in the
    // future
    private static final BigDecimal BASE_PRICE_DEFAULT = new BigDecimal("150.00");
    private static final BigDecimal RUSH_SERVICE_PERCENTAGE = new BigDecimal("0.30"); // 30% markup
    private static final BigDecimal REMOTE_LOCATION_FEE = new BigDecimal("25.00"); // Fixed fee

    /**
     * Calculate base price for a delivery based on zip code
     * For now returns default, but could be enhanced with zip-code based pricing
     */
    public BigDecimal calculateBasePrice(String zipCode) {
        // TODO: Implement zip-code based pricing logic
        // For now, return default base price
        return BASE_PRICE_DEFAULT;
    }

    /**
     * Calculate rush service fee (percentage markup on base price)
     */
    public BigDecimal calculateRushServiceFee(BigDecimal basePrice) {
        if (basePrice == null) {
            basePrice = BASE_PRICE_DEFAULT;
        }
        return basePrice.multiply(RUSH_SERVICE_PERCENTAGE).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Calculate remote location surcharge
     */
    public BigDecimal calculateRemoteLocationFee(String zipCode) {
        // TODO: Could implement logic to determine if zip code is remote
        // For now, return fixed remote location fee
        return REMOTE_LOCATION_FEE;
    }

    /**
     * Calculate total recipient price with all adjustments
     */
    public PricingBreakdown calculateRecipientPricing(String zipCode, boolean rushService, boolean remoteLocation) {
        BigDecimal basePrice = calculateBasePrice(zipCode);
        BigDecimal rushFee = BigDecimal.ZERO;
        BigDecimal remoteFee = BigDecimal.ZERO;

        if (rushService) {
            rushFee = calculateRushServiceFee(basePrice);
        }

        if (remoteLocation) {
            remoteFee = calculateRemoteLocationFee(zipCode);
        }

        BigDecimal total = basePrice.add(rushFee).add(remoteFee);

        return new PricingBreakdown(basePrice, rushFee, remoteFee, total);
    }

    /**
     * Calculate full payment breakdown including commissions
     */
    public PaymentBreakdown calculatePaymentBreakdown(BigDecimal recipientTotal) {
        // Commission rate (15%)
        BigDecimal commissionRate = new BigDecimal("0.15");
        BigDecimal commission = recipientTotal.multiply(commissionRate).setScale(2, RoundingMode.HALF_UP);

        // Super admin fee is 5% of commission
        BigDecimal superAdminFeeRate = new BigDecimal("0.05");
        BigDecimal superAdminFee = commission.multiply(superAdminFeeRate).setScale(2, RoundingMode.HALF_UP);

        // Tenant profit = commission - super admin fee
        BigDecimal tenantProfit = commission.subtract(superAdminFee);

        // Customer pays: recipient total + commission
        BigDecimal customerPayment = recipientTotal.add(commission);

        return new PaymentBreakdown(
                recipientTotal,
                commission,
                superAdminFee,
                tenantProfit,
                customerPayment);
    }

    // Inner classes for pricing data
    public static class PricingBreakdown {
        public final BigDecimal basePrice;
        public final BigDecimal rushServiceFee;
        public final BigDecimal remoteLocationFee;
        public final BigDecimal total;

        public PricingBreakdown(BigDecimal basePrice, BigDecimal rushServiceFee,
                BigDecimal remoteLocationFee, BigDecimal total) {
            this.basePrice = basePrice;
            this.rushServiceFee = rushServiceFee;
            this.remoteLocationFee = remoteLocationFee;
            this.total = total;
        }
    }

    public static class PaymentBreakdown {
        public final BigDecimal recipientTotal;
        public final BigDecimal commission;
        public final BigDecimal superAdminFee;
        public final BigDecimal tenantProfit;
        public final BigDecimal customerPayment;

        public PaymentBreakdown(BigDecimal recipientTotal, BigDecimal commission,
                BigDecimal superAdminFee, BigDecimal tenantProfit,
                BigDecimal customerPayment) {
            this.recipientTotal = recipientTotal;
            this.commission = commission;
            this.superAdminFee = superAdminFee;
            this.tenantProfit = tenantProfit;
            this.customerPayment = customerPayment;
        }
    }
}
