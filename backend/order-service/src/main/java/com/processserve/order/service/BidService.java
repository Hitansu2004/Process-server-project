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

        // For GUIDED recipients, allow bids when ASSIGNED (for price proposals)
        // For AUTOMATED recipients, allow bids when OPEN, PENDING, or BIDDING
        if (recipient.getRecipientType() == OrderRecipient.RecipientType.GUIDED) {
            // GUIDED recipients can receive bids (price proposals) when ASSIGNED to process server
            if (recipient.getStatus() != OrderRecipient.RecipientStatus.ASSIGNED) {
                throw new RuntimeException("GUIDED recipient must be ASSIGNED to accept price proposals");
            }
            // Verify the process server placing the bid is the assigned process server
            if (!recipient.getAssignedProcessServerId().equals(request.getProcessServerId())) {
                throw new RuntimeException("Only the assigned process server can propose a price");
            }
        } else {
            // AUTOMATED recipients can only receive bids when OPEN, PENDING, or BIDDING
            if (recipient.getStatus() != OrderRecipient.RecipientStatus.OPEN &&
                    recipient.getStatus() != OrderRecipient.RecipientStatus.PENDING &&
                    recipient.getStatus() != OrderRecipient.RecipientStatus.BIDDING) {
                throw new RuntimeException("Recipient is not accepting bids");
            }
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

        // Update recipient status to BIDDING if it was PENDING or OPEN (only for AUTOMATED recipients)
        // GUIDED recipients stay ASSIGNED when receiving price proposals
        if (recipient.getRecipientType() != OrderRecipient.RecipientType.GUIDED &&
                (recipient.getStatus() == OrderRecipient.RecipientStatus.PENDING ||
                 recipient.getStatus() == OrderRecipient.RecipientStatus.OPEN)) {
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
        // For AUTOMATED orders, the customer was already charged for service options upfront:
        // - Process Service: $75
        // - Certified Mail: $25
        // - Rush Service: $50
        // - Remote Location: $40
        // The bid amount is ONLY for the base delivery service.
        // We need to ADD the bid amount to the existing fees.

        // Get the existing fees that customer already paid
        BigDecimal existingProcessServiceFee = Boolean.TRUE.equals(recipient.getProcessService()) 
                ? new BigDecimal("75.00") 
                : BigDecimal.ZERO;
        BigDecimal existingCertifiedMailFee = Boolean.TRUE.equals(recipient.getCertifiedMail()) 
                ? new BigDecimal("25.00") 
                : BigDecimal.ZERO;
        BigDecimal existingRushFee = recipient.getRushService() != null && recipient.getRushService()
                ? new BigDecimal("50.00")
                : BigDecimal.ZERO;
        BigDecimal existingRemoteFee = recipient.getRemoteLocation() != null && recipient.getRemoteLocation()
                ? new BigDecimal("40.00")
                : BigDecimal.ZERO;

        // Bid amount is the base delivery price from process server
        BigDecimal basePrice = bid.getBidAmount();

        // Total price = bid amount + existing service fees
        BigDecimal totalPrice = basePrice
                .add(existingProcessServiceFee)
                .add(existingCertifiedMailFee)
                .add(existingRushFee)
                .add(existingRemoteFee);

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

        // Update recipient with assignment
        recipient.setAssignedProcessServerId(bid.getProcessServerId());
        recipient.setStatus(OrderRecipient.RecipientStatus.ASSIGNED);
        recipientRepository.save(recipient);

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

    // Customer counter-offers the process server's bid
    @Transactional
    public Bid customerCounterOffer(String bidId, Double counterAmount, String notes) {
        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found"));

        if (bid.getStatus() != Bid.BidStatus.PENDING) {
            throw new RuntimeException("Can only counter-offer on pending bids");
        }

        bid.setCustomerCounterAmount(BigDecimal.valueOf(counterAmount));
        bid.setCustomerCounterNotes(notes);
        // Initialize to 0 if null (for existing bids)
        Integer currentCount = bid.getCounterOfferCount();
        bid.setCounterOfferCount(currentCount == null ? 1 : currentCount + 1);
        bid.setLastCounterBy("CUSTOMER");

        return bidRepository.save(bid);
    }

    // Process server accepts customer's counter-offer
    @Transactional
    public void acceptCustomerCounter(String bidId) {
        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found"));

        if (bid.getCustomerCounterAmount() == null) {
            throw new RuntimeException("No counter-offer to accept");
        }

        if (!"CUSTOMER".equals(bid.getLastCounterBy())) {
            throw new RuntimeException("No customer counter-offer pending");
        }

        // Update bid amount to counter amount and accept
        bid.setBidAmount(bid.getCustomerCounterAmount());
        bid.setStatus(Bid.BidStatus.ACCEPTED);

        // Update recipient
        OrderRecipient recipient = bid.getRecipient();
        recipient.setStatus(OrderRecipient.RecipientStatus.IN_PROGRESS);
        recipient.setAssignedProcessServerId(bid.getProcessServerId());

        recipientRepository.save(recipient);
        bidRepository.save(bid);

        // Reject other bids for this recipient
        List<Bid> otherBids = bidRepository.findByOrderRecipientId(recipient.getId());
        for (Bid otherBid : otherBids) {
            if (!otherBid.getId().equals(bidId) && otherBid.getStatus() == Bid.BidStatus.PENDING) {
                otherBid.setStatus(Bid.BidStatus.REJECTED);
                bidRepository.save(otherBid);
            }
        }

        // Update order status if all recipients are assigned
        Order order = recipient.getOrder();
        boolean allAssigned = order.getRecipients().stream()
                .allMatch(r -> r.getStatus() == OrderRecipient.RecipientStatus.IN_PROGRESS ||
                              r.getStatus() == OrderRecipient.RecipientStatus.DELIVERED);
        
        if (allAssigned) {
            order.setStatus(Order.OrderStatus.ASSIGNED);
            orderRepository.save(order);
        } else if (order.getStatus() == Order.OrderStatus.OPEN || order.getStatus() == Order.OrderStatus.BIDDING) {
            order.setStatus(Order.OrderStatus.PARTIALLY_ASSIGNED);
            orderRepository.save(order);
        }
    }

    // Process server rejects customer's counter and proposes new amount
    @Transactional
    public Bid processServerRejectsAndCounters(String bidId, Double newAmount, String notes) {
        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found"));

        if (bid.getCustomerCounterAmount() == null) {
            throw new RuntimeException("No counter-offer to reject");
        }

        if (!"CUSTOMER".equals(bid.getLastCounterBy())) {
            throw new RuntimeException("No customer counter-offer to reject");
        }

        // Update bid with new amount and notes
        bid.setBidAmount(BigDecimal.valueOf(newAmount));
        bid.setComment(notes);
        // Initialize to 0 if null (for existing bids)
        Integer currentCount = bid.getCounterOfferCount();
        bid.setCounterOfferCount(currentCount == null ? 1 : currentCount + 1);
        bid.setLastCounterBy("PROCESS_SERVER");
        // Clear customer counter since PS proposed new amount
        bid.setCustomerCounterAmount(null);
        bid.setCustomerCounterNotes(null);

        return bidRepository.save(bid);
    }
}
