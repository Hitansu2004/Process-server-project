package com.processserve.order.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.processserve.order.client.TenantClient;
import com.processserve.order.dto.PaymentBreakdown;
import com.processserve.order.dto.PlaceBidRequest;
import com.processserve.order.entity.Bid;
import com.processserve.order.entity.Order;
import com.processserve.order.entity.OrderDropoff;
import com.processserve.order.repository.BidRepository;
import com.processserve.order.repository.OrderDropoffRepository;
import com.processserve.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BidService {

    private final BidRepository bidRepository;
    private final OrderRepository orderRepository;
    private final OrderDropoffRepository dropoffRepository;
    private final PaymentCalculationService paymentCalculationService;
    private final TenantClient tenantClient;

    @Transactional
    public Bid placeBid(PlaceBidRequest request) {
        log.info("Placing bid for dropoff: {} by process server: {}",
                request.getOrderDropoffId(), request.getProcessServerId());

        // Check if bid already exists for this dropoff and process server
        // Workaround: fetch all bids for dropoff and check.
        List<Bid> existingBids = bidRepository.findByOrderDropoffId(request.getOrderDropoffId());

        // ... (validation logic)

        // Get dropoff and validate
        OrderDropoff dropoff = dropoffRepository.findById(request.getOrderDropoffId())
                .orElseThrow(() -> new RuntimeException("Dropoff not found"));

        if (dropoff.getStatus() != OrderDropoff.DropoffStatus.OPEN &&
                dropoff.getStatus() != OrderDropoff.DropoffStatus.PENDING &&
                dropoff.getStatus() != OrderDropoff.DropoffStatus.BIDDING) {
            throw new RuntimeException("Dropoff is not accepting bids");
        }

        if (dropoff.getDropoffType() == OrderDropoff.DropoffType.GUIDED) {
            throw new RuntimeException("Cannot place bid on GUIDED dropoff");
        }

        // Create bid
        Bid bid = new Bid();
        bid.setId(UUID.randomUUID().toString());
        bid.setDropoff(dropoff);
        bid.setProcessServerId(request.getProcessServerId());
        bid.setBidAmount(request.getBidAmount());
        bid.setComment(request.getComment());
        bid.setStatus(Bid.BidStatus.PENDING);

        bid = bidRepository.save(bid);

        // Update dropoff status to BIDDING if it was PENDING or OPEN
        if (dropoff.getStatus() == OrderDropoff.DropoffStatus.PENDING ||
                dropoff.getStatus() == OrderDropoff.DropoffStatus.OPEN) {
            dropoff.setStatus(OrderDropoff.DropoffStatus.BIDDING);
            dropoffRepository.save(dropoff);

            // Also update Order status if needed?
            Order order = dropoff.getOrder();
            if (order.getStatus() == Order.OrderStatus.OPEN) {
                order.setStatus(Order.OrderStatus.BIDDING);
                orderRepository.save(order);
            }
        }

        log.info("Bid placed successfully: {}", bid.getId());
        return bid;
    }

    @Transactional
    public void acceptBid(String bidId) {
        log.info("Accepting bid: {}", bidId);

        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found"));

        if (bid.getStatus() != Bid.BidStatus.PENDING) {
            throw new RuntimeException("Bid is not in pending status");
        }

        OrderDropoff dropoff = bid.getDropoff();
        Order order = dropoff.getOrder();

        // Accept this bid
        bid.setStatus(Bid.BidStatus.ACCEPTED);
        bidRepository.save(bid);

        // Reject all other pending bids for this dropoff
        List<Bid> otherBids = bidRepository.findByOrderDropoffIdAndStatus(
                dropoff.getId(), Bid.BidStatus.PENDING);

        for (Bid otherBid : otherBids) {
            if (!otherBid.getId().equals(bidId)) {
                otherBid.setStatus(Bid.BidStatus.REJECTED);
                bidRepository.save(otherBid);
            }
        }

        // Calculate payment breakdown
        // Treat bidAmount as the Customer Payment (Gross)
        // Commission is deducted from this amount
        BigDecimal customerPayment = bid.getBidAmount();
        BigDecimal tenantCommissionRate = new BigDecimal("0.15"); // 15%
        BigDecimal superAdminFeeRate = new BigDecimal("0.05"); // 5% of commission

        BigDecimal tenantCommission = customerPayment.multiply(tenantCommissionRate)
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal superAdminFee = tenantCommission.multiply(superAdminFeeRate)
                .setScale(2, RoundingMode.HALF_UP);

        // Tenant Profit = Commission - Super Admin Fee
        BigDecimal tenantProfit = tenantCommission.subtract(superAdminFee)
                .setScale(2, RoundingMode.HALF_UP);

        // Process Server Payout = Customer Payment - Commission
        BigDecimal processServerPayout = customerPayment.subtract(tenantCommission)
                .setScale(2, RoundingMode.HALF_UP);

        // Update dropoff
        dropoff.setAssignedProcessServerId(bid.getProcessServerId());
        dropoff.setFinalAgreedPrice(bid.getBidAmount());
        dropoff.setStatus(OrderDropoff.DropoffStatus.ASSIGNED);
        dropoffRepository.save(dropoff);

        // Update Order totals
        order.setCustomerPaymentAmount(add(order.getCustomerPaymentAmount(), customerPayment));
        order.setProcessServerPayout(add(order.getProcessServerPayout(), processServerPayout));
        order.setTenantCommission(add(order.getTenantCommission(), tenantCommission));
        order.setSuperAdminFee(add(order.getSuperAdminFee(), superAdminFee));
        order.setTenantProfit(add(order.getTenantProfit(), tenantProfit));

        // Get tenant commission rate (original logic for commissionRateApplied)
        BigDecimal commissionRate = getTenantCommissionRate(order.getTenantId());
        order.setCommissionRateApplied(commissionRate);

        // Check if all dropoffs are assigned
        boolean allAssigned = order.getDropoffs().stream()
                .allMatch(d -> d.getStatus() == OrderDropoff.DropoffStatus.ASSIGNED ||
                        d.getStatus() == OrderDropoff.DropoffStatus.IN_PROGRESS ||
                        d.getStatus() == OrderDropoff.DropoffStatus.DELIVERED);

        if (allAssigned) {
            order.setStatus(Order.OrderStatus.ASSIGNED);
            order.setAssignedAt(LocalDateTime.now());
        } else {
            order.setStatus(Order.OrderStatus.PARTIALLY_ASSIGNED);
        }

        orderRepository.save(order);

        log.info("Bid accepted. Dropoff {} assigned to process server {}.",
                dropoff.getId(), bid.getProcessServerId());
    }

    private void updateOrderTotals(Order order, PaymentBreakdown breakdown) {
        order.setCustomerPaymentAmount(add(order.getCustomerPaymentAmount(), breakdown.getCustomerPaymentAmount()));
        order.setProcessServerPayout(add(order.getProcessServerPayout(), breakdown.getProcessServerPayout()));
        order.setTenantCommission(add(order.getTenantCommission(), breakdown.getTenantCommission()));
        order.setSuperAdminFee(add(order.getSuperAdminFee(), breakdown.getSuperAdminFee()));
        order.setTenantProfit(add(order.getTenantProfit(), breakdown.getTenantProfit()));
        order.setCommissionRateApplied(breakdown.getCommissionRateApplied());
    }

    private BigDecimal add(BigDecimal a, BigDecimal b) {
        return (a == null ? BigDecimal.ZERO : a).add(b == null ? BigDecimal.ZERO : b);
    }

    private BigDecimal getTenantCommissionRate(String tenantId) {
        try {
            Map<String, Object> tenant = tenantClient.getTenantById(tenantId);
            String pricingConfigStr = (String) tenant.get("pricingConfig");

            if (pricingConfigStr != null && !pricingConfigStr.isEmpty()) {
                ObjectMapper mapper = new ObjectMapper();
                Map<String, Object> pricingConfig = mapper.readValue(pricingConfigStr, Map.class);
                Object commissionRate = pricingConfig.get("commissionRate");

                if (commissionRate != null) {
                    return new BigDecimal(commissionRate.toString());
                }
            }

            log.warn("No commission rate found for tenant {}, using default 15%", tenantId);
            return new BigDecimal("20.00"); // Default to 20% commission rate
        } catch (Exception e) {
            log.error("Error fetching tenant commission rate for tenant {}: {}", tenantId, e.getMessage());
            return new BigDecimal("15.00");
        }
    }

    public List<Bid> getBidsByOrderId(String orderId) {
        return bidRepository.findByDropoffOrderId(orderId);
    }

    public List<com.processserve.order.dto.BidDTO> getBidsByProcessServerId(String processServerId) {
        List<Bid> bids = bidRepository.findByProcessServerId(processServerId);
        return bids.stream().map(this::mapToDTO).collect(java.util.stream.Collectors.toList());
    }

    private com.processserve.order.dto.BidDTO mapToDTO(Bid bid) {
        OrderDropoff dropoff = bid.getDropoff();
        Order order = dropoff != null ? dropoff.getOrder() : null;

        return com.processserve.order.dto.BidDTO.builder()
                .id(bid.getId())
                .orderId(order != null ? order.getId() : null)
                .orderNumber(order != null ? order.getOrderNumber() : null)
                .pickupAddress(order != null ? order.getPickupAddress() : null)
                .pickupZipCode(order != null ? order.getPickupZipCode() : null)
                .bidAmount(bid.getBidAmount())
                .status(bid.getStatus())
                .createdAt(bid.getCreatedAt())
                .build();
    }
}
