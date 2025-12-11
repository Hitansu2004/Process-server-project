package com.processserve.order.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentBreakdown {
    private BigDecimal customerPaymentAmount;
    private BigDecimal processServerPayout;
    private BigDecimal tenantCommission;
    private BigDecimal superAdminFee;
    private BigDecimal tenantProfit;
    private BigDecimal commissionRateApplied;
}
