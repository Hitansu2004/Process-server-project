package com.processserve.order.service;

import com.processserve.order.dto.CreateOrderRequest;
import com.processserve.order.dto.RecordAttemptRequest;
import com.processserve.order.entity.*;
import com.processserve.order.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderDropoffRepository dropoffRepository;
    private final ProcessServerAttemptRepository attemptRepository;
    private final BidRepository bidRepository;

    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        log.info("Creating new order for customer: {}", request.getCustomerId());

        // Create main order
        Order order = new Order();
        order.setId(UUID.randomUUID().toString());
        order.setTenantId(request.getTenantId());
        order.setCustomerId(request.getCustomerId());
        // Generate customer-specific order number (e.g., C3771-ORD1)
        String shortId = request.getCustomerId().substring(request.getCustomerId().length() - 4);
        long nextOrderNum = orderRepository.countByCustomerId(request.getCustomerId()) + 1;
        order.setOrderNumber("C" + shortId + "-ORD" + nextOrderNum);
        order.setStatus(Order.OrderStatus.OPEN);
        order.setPickupAddress(request.getPickupAddress());
        order.setPickupZipCode(request.getPickupZipCode());
        order.setSpecialInstructions(request.getSpecialInstructions());
        order.setDeadline(request.getDeadline());
        order.setHasMultipleDropoffs(request.getDropoffs().size() > 1);
        order.setTotalDropoffs(request.getDropoffs().size());

        // Initialize totals
        order.setCustomerPaymentAmount(BigDecimal.ZERO);
        order.setProcessServerPayout(BigDecimal.ZERO);
        order.setTenantCommission(BigDecimal.ZERO);
        order.setSuperAdminFee(BigDecimal.ZERO);
        order.setTenantProfit(BigDecimal.ZERO);

        order = orderRepository.save(order);

        // Create dropoffs
        int sequence = 1;
        boolean anyAssigned = false;
        boolean anyBidding = false;

        for (CreateOrderRequest.DropoffRequest dropoffReq : request.getDropoffs()) {
            OrderDropoff dropoff = new OrderDropoff();
            dropoff.setId(UUID.randomUUID().toString());
            dropoff.setOrder(order);
            dropoff.setSequenceNumber(sequence++);
            dropoff.setRecipientName(dropoffReq.getRecipientName());
            dropoff.setDropoffAddress(dropoffReq.getDropoffAddress());
            dropoff.setDropoffZipCode(dropoffReq.getDropoffZipCode());
            dropoff.setAttemptCount(0);
            dropoff.setMaxAttempts(5);

            // Handle Dropoff Type
            if ("GUIDED".equalsIgnoreCase(dropoffReq.getDropoffType())) {
                dropoff.setDropoffType(OrderDropoff.DropoffType.GUIDED);
                dropoff.setAssignedProcessServerId(dropoffReq.getAssignedProcessServerId());
                dropoff.setFinalAgreedPrice(dropoffReq.getFinalAgreedPrice());
                dropoff.setStatus(OrderDropoff.DropoffStatus.ASSIGNED);
                anyAssigned = true;

                // Update Order totals for guided dropoffs
                if (dropoffReq.getFinalAgreedPrice() != null) {
                    order.setProcessServerPayout(order.getProcessServerPayout().add(dropoffReq.getFinalAgreedPrice()));
                }

                if (dropoffReq.getCustomerPrice() != null) {
                    // Concierge Service: Admin sets specific customer price
                    order.setCustomerPaymentAmount(order.getCustomerPaymentAmount().add(dropoffReq.getCustomerPrice()));

                    // Calculate Tenant Profit immediately if both prices are set
                    // Profit = Customer Price - Payout - Super Admin Fee (assuming 0 for now or
                    // calculated)
                    // We need to calculate Super Admin Fee based on Payout or Customer Price?
                    // Usually Super Admin Fee is a percentage of the transaction.
                    // Let's assume Super Admin Fee is calculated later or 0 for now.
                    // Tenant Profit = Customer Price - Payout
                    if (dropoffReq.getFinalAgreedPrice() != null) {
                        BigDecimal profit = dropoffReq.getCustomerPrice().subtract(dropoffReq.getFinalAgreedPrice());
                        order.setTenantProfit(order.getTenantProfit().add(profit));
                    }
                } else if (dropoffReq.getFinalAgreedPrice() != null) {
                    // Regular Guided: Calculate commissions
                    BigDecimal payout = dropoffReq.getFinalAgreedPrice();
                    BigDecimal superAdminFee = payout.multiply(new BigDecimal("0.05")); // 5% fee
                    BigDecimal commission = payout.multiply(new BigDecimal("0.15")); // 15% commission
                    BigDecimal totalCustomerPay = payout.add(commission).add(superAdminFee);

                    order.setSuperAdminFee(order.getSuperAdminFee().add(superAdminFee));
                    order.setTenantCommission(order.getTenantCommission().add(commission));
                    order.setTenantProfit(order.getTenantProfit().add(commission)); // Profit = Commission
                    order.setCustomerPaymentAmount(order.getCustomerPaymentAmount().add(totalCustomerPay));
                }

            } else {
                dropoff.setDropoffType(OrderDropoff.DropoffType.AUTOMATED);
                // Set to OPEN - will change to BIDDING when first bid is placed
                dropoff.setStatus(OrderDropoff.DropoffStatus.OPEN);
                anyBidding = true; // Track that we have automated dropoffs
            }

            dropoffRepository.save(dropoff);
        }

        // Update Order Status based on dropoffs
        if (anyAssigned && !anyBidding) {
            // All dropoffs are GUIDED and assigned
            order.setStatus(Order.OrderStatus.ASSIGNED);
            order.setAssignedAt(LocalDateTime.now());
        } else if (anyAssigned && anyBidding) {
            // Mix of GUIDED and AUTOMATED dropoffs
            order.setStatus(Order.OrderStatus.PARTIALLY_ASSIGNED);
        }
        // else: keep status as OPEN - will change to BIDDING when first bid is placed

        orderRepository.save(order);

        // Trigger notification service (would be implemented via Feign or messaging)
        log.info("Order created successfully: {}", order.getId());

        return order;
    }

    private final com.processserve.order.client.UserClient userClient;

    @Transactional
    public void recordAttempt(RecordAttemptRequest request) {
        log.info("Recording delivery attempt for dropoff: {}", request.getDropoffId());

        OrderDropoff dropoff = dropoffRepository.findById(request.getDropoffId())
                .orElseThrow(() -> new RuntimeException("Dropoff not found"));

        // Validate GPS coordinates exist
        if (request.getGpsLatitude() == null || request.getGpsLongitude() == null) {
            throw new RuntimeException("GPS coordinates are required");
        }

        // Increment attempt count
        int currentAttempts = dropoff.getAttemptCount() + 1;
        dropoff.setAttemptCount(currentAttempts);

        // Create and save attempt record
        ProcessServerAttempt attempt = new ProcessServerAttempt();
        attempt.setId(UUID.randomUUID().toString());
        attempt.setDropoff(dropoff);
        attempt.setProcessServerId(request.getProcessServerId());
        attempt.setAttemptNumber(currentAttempts);
        attempt.setWasSuccessful(request.getWasSuccessful());
        attempt.setOutcomeNotes(request.getOutcomeNotes());
        attempt.setGpsLatitude(request.getGpsLatitude());
        attempt.setGpsLongitude(request.getGpsLongitude());
        attempt.setPhotoProofUrl(request.getPhotoProofUrl());
        attempt.setIsValidAttempt(true); // Simplified GPS validation

        attemptRepository.save(attempt);

        // Apply 5-attempt business logic
        if (request.getWasSuccessful()) {
            // SUCCESS - Mark dropoff as delivered
            dropoff.setStatus(OrderDropoff.DropoffStatus.DELIVERED);
            dropoff.setDeliveredAt(LocalDateTime.now());
            dropoffRepository.save(dropoff);

            // Check if ALL dropoffs for this order are delivered
            Order order = dropoff.getOrder();
            boolean allDelivered = order.getDropoffs().stream()
                    .allMatch(d -> d.getStatus() == OrderDropoff.DropoffStatus.DELIVERED);

            if (allDelivered) {
                order.setStatus(Order.OrderStatus.COMPLETED);
                order.setCompletedAt(LocalDateTime.now());
                orderRepository.save(order);

                log.info("Order {} completed successfully", order.getId());

                // Update process server stats (via Feign to user-service)
                try {
                    // Update stats: successful=true, attempts=currentAttempts
                    java.util.Map<String, Object> statsRequest = new java.util.HashMap<>();
                    statsRequest.put("successful", true);
                    statsRequest.put("attemptCount", currentAttempts);
                    userClient.updateStats(request.getProcessServerId(), statsRequest);

                    // Auto-add to contact list
                    userClient.autoAddProcessServer(order.getCustomerId(), request.getProcessServerId());
                } catch (Exception e) {
                    log.error("Failed to update stats or auto-add process server", e);
                }
            }

        } else if (currentAttempts >= dropoff.getMaxAttempts()) {
            // MAX ATTEMPTS REACHED - FAILED BUT STILL PAY
            dropoff.setStatus(OrderDropoff.DropoffStatus.FAILED);
            dropoffRepository.save(dropoff);

            // Update stats for failure
            try {
                java.util.Map<String, Object> statsRequest = new java.util.HashMap<>();
                statsRequest.put("successful", false);
                statsRequest.put("attemptCount", currentAttempts);
                userClient.updateStats(request.getProcessServerId(), statsRequest);
            } catch (Exception e) {
                log.error("Failed to update stats for failure", e);
            }

            Order order = dropoff.getOrder();
            boolean allDone = order.getDropoffs().stream()
                    .allMatch(d -> d.getStatus() == OrderDropoff.DropoffStatus.DELIVERED ||
                            d.getStatus() == OrderDropoff.DropoffStatus.FAILED);

            if (allDone) {
                boolean anyFailed = order.getDropoffs().stream()
                        .anyMatch(d -> d.getStatus() == OrderDropoff.DropoffStatus.FAILED);

                if (anyFailed) {
                    order.setStatus(Order.OrderStatus.FAILED);
                } else {
                    order.setStatus(Order.OrderStatus.COMPLETED);
                }
                order.setCompletedAt(LocalDateTime.now());
                orderRepository.save(order);
            }

            log.warn("Dropoff {} failed after {} attempts", dropoff.getId(), currentAttempts);
            checkAndUpdateRedZone(request.getProcessServerId());

        } else {
            // More attempts remaining
            dropoff.setStatus(OrderDropoff.DropoffStatus.IN_PROGRESS);
            dropoffRepository.save(dropoff);

            // Update Order status to IN_PROGRESS if not already
            Order order = dropoff.getOrder();
            if (order.getStatus() != Order.OrderStatus.IN_PROGRESS) {
                order.setStatus(Order.OrderStatus.IN_PROGRESS);
                orderRepository.save(order);
            }

            log.info("Attempt {} of {} recorded for dropoff {}",
                    currentAttempts, dropoff.getMaxAttempts(), dropoff.getId());
        }
    }

    private void checkAndUpdateRedZone(String processServerId) {
        // Placeholder
    }

    public Order getOrderById(String id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public List<Order> getOrdersByCustomerId(String customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    public List<Order> getOrdersByProcessServerId(String processServerId) {
        return orderRepository.findDistinctByDropoffsAssignedProcessServerId(processServerId);
    }

    public List<Order> getAvailableOrders() {
        List<Order.OrderStatus> statuses = List.of(Order.OrderStatus.OPEN, Order.OrderStatus.BIDDING);

        return orderRepository.findAll().stream()
                .filter(order -> statuses.contains(order.getStatus()))
                .toList();
    }

    public List<Order> getOrdersByTenantId(String tenantId) {
        return orderRepository.findAll().stream()
                .filter(order -> tenantId.equals(order.getTenantId()))
                .toList();
    }

    public BigDecimal getPlatformRevenue() {
        return orderRepository.findAll().stream()
                .filter(order -> order.getStatus() == Order.OrderStatus.COMPLETED)
                .map(Order::getSuperAdminFee)
                .filter(fee -> fee != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public boolean validateRatingEligibility(String orderId, String customerId, String processServerId) {
        return orderRepository.findById(orderId)
                .map(order -> {
                    boolean isCompleted = order.getStatus() == Order.OrderStatus.COMPLETED;
                    boolean isCustomerMatch = order.getCustomerId().equals(customerId);
                    // Check if process server was assigned to any dropoff
                    boolean isProcessServerMatch = order.getDropoffs().stream()
                            .anyMatch(d -> processServerId.equals(d.getAssignedProcessServerId()));

                    return isCompleted && isCustomerMatch && isProcessServerMatch;
                })
                .orElse(false);
    }
}
