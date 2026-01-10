package com.processserve.order.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.processserve.order.client.TenantClient;

import com.processserve.order.dto.PlaceBidRequest;
import com.processserve.order.entity.Bid;
import com.processserve.order.entity.Order;
import com.processserve.order.entity.OrderRecipient;
import com.processserve.order.repository.BidRepository;
import com.processserve.order.repository.OrderRecipientRepository;
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
    private final OrderRecipientRepository recipientRepository;

    private final TenantClient tenantClient;
    private final com.processserve.order.client.NotificationClient notificationClient;

    @Transactional
    public Bid placeBid(PlaceBidRequest request) {
        log.info("Placing bid for recipient: {} by process server: {}",
                request.getOrderRecipientId(), request.getProcessServerId());

        // Check if bid already exists for this recipient and process server
        // Workaround: fetch all bids for recipient and check.

        // ... (validation logic)

        // Get recipient and validate
        OrderRecipient recipient = recipientRepository.findById(request.getOrderRecipientId())
                .orElseThrow(() -> new RuntimeException("Recipient not found"));

        if (recipient.getStatus() != OrderRecipient.RecipientStatus.OPEN &&
                recipient.getStatus() != OrderRecipient.RecipientStatus.PENDING &&
                recipient.getStatus() != OrderRecipient.RecipientStatus.BIDDING) {
            throw new RuntimeException("Recipient is not accepting bids");
        }

        if (recipient.getRecipientType() == OrderRecipient.RecipientType.GUIDED) {
            throw new RuntimeException("Cannot place bid on GUIDED recipient");
        }

        // Create bid
        Bid bid = new Bid();
        bid.setId(UUID.randomUUID().toString());
        bid.setRecipient(recipient);
        bid.setProcessServerId(request.getProcessServerId());
        bid.setBidAmount(request.getBidAmount());
        bid.setComment(request.getComment());
        bid.setStatus(Bid.BidStatus.PENDING);

        bid = bidRepository.save(bid);

        // Update recipient status to BIDDING if it was PENDING or OPEN
        if (recipient.getStatus() == OrderRecipient.RecipientStatus.PENDING ||
                recipient.getStatus() == OrderRecipient.RecipientStatus.OPEN) {
            recipient.setStatus(OrderRecipient.RecipientStatus.BIDDING);
            recipientRepository.save(recipient);

            // Also update Order status if needed?
            Order order = recipient.getOrder();
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

        OrderRecipient recipient = bid.getRecipient();
        Order order = recipient.getOrder();

        // Accept this bid
        bid.setStatus(Bid.BidStatus.ACCEPTED);
        bidRepository.save(bid);

        // Reject all other pending bids for this recipient
        List<Bid> otherBids = bidRepository.findByOrderRecipientIdAndStatus(
                recipient.getId(), Bid.BidStatus.PENDING);

        for (Bid otherBid : otherBids) {
            if (!otherBid.getId().equals(bidId)) {
                otherBid.setStatus(Bid.BidStatus.REJECTED);
                bidRepository.save(otherBid);
            }
        }

        // Calculate payment breakdown
        // Treat bidAmount as the BASE PRICE for the recipient
        // Add rush and remote fees if applicable
        BigDecimal basePrice = bid.getBidAmount();
        BigDecimal rushFee = recipient.getRushService() != null && recipient.getRushService()
                ? new BigDecimal("50.00")
                : BigDecimal.ZERO;
        BigDecimal remoteFee = recipient.getRemoteLocation() != null && recipient.getRemoteLocation()
                ? new BigDecimal("30.00")
                : BigDecimal.ZERO;

        // Total price = bid amount + rush + remote
        BigDecimal totalPrice = basePrice.add(rushFee).add(remoteFee);

        // Customer pays the total price
        BigDecimal customerPayment = totalPrice;
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

        // Update recipient with final pricing
        recipient.setAssignedProcessServerId(bid.getProcessServerId());
        recipient.setBasePrice(basePrice); // Set base price from bid
        recipient.setRushServiceFee(rushFee); // Calculate rush fee
        recipient.setRemoteLocationFee(remoteFee); // Calculate remote fee
        recipient.setFinalAgreedPrice(totalPrice); // Total = base + rush + remote
        recipient.setStatus(OrderRecipient.RecipientStatus.ASSIGNED);
        recipientRepository.save(recipient);

        // Update Order totals
        order.setCustomerPaymentAmount(add(order.getCustomerPaymentAmount(), customerPayment));
        order.setProcessServerPayout(add(order.getProcessServerPayout(), processServerPayout));
        order.setTenantCommission(add(order.getTenantCommission(), tenantCommission));
        order.setSuperAdminFee(add(order.getSuperAdminFee(), superAdminFee));
        order.setTenantProfit(add(order.getTenantProfit(), tenantProfit));

        // Get tenant commission rate (original logic for commissionRateApplied)
        BigDecimal commissionRate = getTenantCommissionRate(order.getTenantId());
        order.setCommissionRateApplied(commissionRate);

        // Check if all recipients are assigned
        boolean allAssigned = order.getRecipients().stream()
                .allMatch(d -> d.getStatus() == OrderRecipient.RecipientStatus.ASSIGNED ||
                        d.getStatus() == OrderRecipient.RecipientStatus.IN_PROGRESS ||
                        d.getStatus() == OrderRecipient.RecipientStatus.DELIVERED);

        if (allAssigned) {
            order.setStatus(Order.OrderStatus.ASSIGNED);
            order.setAssignedAt(LocalDateTime.now());
        } else {
            order.setStatus(Order.OrderStatus.PARTIALLY_ASSIGNED);
        }

        orderRepository.save(order);

        log.info("Bid accepted. Recipient {} assigned to process server {}.",
                recipient.getId(), bid.getProcessServerId());

        // Send notification to Process Server
        try {
            notificationClient.createNotification(com.processserve.order.dto.NotificationRequest.builder()
                    .tenantId(order.getTenantId())
                    .userId(bid.getProcessServerId())
                    .type("BID_ACCEPTED")
                    .title("Bid Accepted")
                    .message("Your bid for order " + order.getOrderNumber() + " has been accepted.")
                    .relatedOrderId(order.getId())
                    .build());
            log.info("Notification sent to process server {}", bid.getProcessServerId());
        } catch (Exception e) {
            log.error("Failed to send notification: {}", e.getMessage());
        }
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
        return bidRepository.findByRecipientOrderId(orderId);
    }

    public List<com.processserve.order.dto.BidDTO> getBidsByProcessServerId(String processServerId) {
        List<Bid> bids = bidRepository.findByProcessServerId(processServerId);
        return bids.stream().map(this::mapToDTO).collect(java.util.stream.Collectors.toList());
    }

    private com.processserve.order.dto.BidDTO mapToDTO(Bid bid) {
        OrderRecipient recipient = bid.getRecipient();
        Order order = recipient != null ? recipient.getOrder() : null;

        return com.processserve.order.dto.BidDTO.builder()
                .id(bid.getId())
                .orderId(order != null ? order.getId() : null)
                .orderNumber(order != null ? order.getOrderNumber() : null)
                .bidAmount(bid.getBidAmount())
                .status(bid.getStatus())
                .createdAt(bid.getCreatedAt())
                .build();
    }
}
