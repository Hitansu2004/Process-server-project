package com.processserve.order.service;

import com.processserve.order.dto.PaymentBreakdown;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@Slf4j
public class PaymentCalculationService {

    private static final BigDecimal SUPER_ADMIN_FEE_RATE = new BigDecimal("0.05"); // 5%
    private static final BigDecimal HUNDRED = new BigDecimal("100");

    /**
     * Calculate payment breakdown for commission distribution
     * 
     * @param agreedPrice          The final agreed price (bid amount)
     * @param tenantCommissionRate Commission rate percentage (e.g., 15 for 15%)
     * @return PaymentBreakdown with all calculated amounts
     */
    public PaymentBreakdown calculatePaymentBreakdown(
            BigDecimal agreedPrice,
            BigDecimal tenantCommissionRate) {

        log.debug("Calculating payment breakdown for amount: {} with commission rate: {}%",
                agreedPrice, tenantCommissionRate);

        // Customer payment amount (same as agreed price)
        BigDecimal customerPayment = agreedPrice;

        // Tenant commission = agreedPrice * (rate / 100)
        BigDecimal tenantCommission = agreedPrice
                .multiply(tenantCommissionRate)
                .divide(HUNDRED, 2, RoundingMode.HALF_UP);

        // Delivery person payout = agreedPrice - tenantCommission
        BigDecimal deliveryPayout = agreedPrice.subtract(tenantCommission);

        // Super admin fee = tenantCommission * 5%
        BigDecimal superAdminFee = tenantCommission
                .multiply(SUPER_ADMIN_FEE_RATE)
                .setScale(2, RoundingMode.HALF_UP);

        // Tenant profit = tenantCommission - superAdminFee
        BigDecimal tenantProfit = tenantCommission.subtract(superAdminFee);

        PaymentBreakdown breakdown = new PaymentBreakdown(
                customerPayment,
                deliveryPayout,
                tenantCommission,
                superAdminFee,
                tenantProfit,
                tenantCommissionRate);

        log.info("Payment breakdown calculated - Customer: {}, Delivery: {}, Tenant: {}, Super Admin: {}",
                customerPayment, deliveryPayout, tenantProfit, superAdminFee);

        return breakdown;
    }
}
