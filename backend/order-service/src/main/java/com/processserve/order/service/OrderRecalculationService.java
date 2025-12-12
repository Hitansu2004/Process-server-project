package com.processserve.order.service;

import com.processserve.order.entity.Order;
import com.processserve.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderRecalculationService {

    private final OrderRepository orderRepository;

    /**
     * Recalculate all COMPLETED orders to fix the super admin fee calculation
     * This should be run once to fix historical data
     */
    @Transactional
    public void recalculateAllCompletedOrders() {
        log.info("Starting recalculation of all completed orders...");

        List<Order> completedOrders = orderRepository.findAll().stream()
                .filter(order -> order.getStatus() == Order.OrderStatus.COMPLETED)
                .filter(order -> order.getCustomerPaymentAmount() != null)
                .toList();

        log.info("Found {} completed orders to recalculate", completedOrders.size());

        int recalculated = 0;
        for (Order order : completedOrders) {
            try {
                recalculateOrder(order);
                orderRepository.save(order);
                recalculated++;
            } catch (Exception e) {
                log.error("Failed to recalculate order {}: {}", order.getId(), e.getMessage());
            }
        }

        log.info("Recalculation complete. Updated {} orders", recalculated);
    }

    private void recalculateOrder(Order order) {
        // Current values
        BigDecimal customerPayment = order.getCustomerPaymentAmount();
        BigDecimal serverPayout = order.getProcessServerPayout();

        if (customerPayment == null || serverPayout == null) {
            log.warn("Order {} has null payment values, skipping", order.getId());
            return;
        }

        // Calculate correct commission
        BigDecimal tenantCommission = customerPayment.subtract(serverPayout)
                .setScale(2, RoundingMode.HALF_UP);

        // Calculate correct super admin fee (5% of commission)
        BigDecimal superAdminFee = tenantCommission.multiply(new BigDecimal("0.05"))
                .setScale(2, RoundingMode.HALF_UP);

        // Calculate correct tenant profit (commission - super admin fee)
        BigDecimal tenantProfit = tenantCommission.subtract(superAdminFee)
                .setScale(2, RoundingMode.HALF_UP);

        // Update order
        order.setTenantCommission(tenantCommission);
        order.setSuperAdminFee(superAdminFee);
        order.setTenantProfit(tenantProfit);

        log.debug("Recalculated order {}: Commission={}, SuperFee={}, Profit={}",
                order.getOrderNumber(), tenantCommission, superAdminFee, tenantProfit);
    }
}
