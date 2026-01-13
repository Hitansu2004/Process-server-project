package com.processserve.order.service;

import com.processserve.order.dto.*;
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
public class PriceNegotiationService {

    private final PriceNegotiationRepository negotiationRepository;
    private final OrderRecipientRepository recipientRepository;
    private final OrderRepository orderRepository;

    /**
     * Process Server proposes a price for a GUIDED order
     */
    @Transactional
    public PriceNegotiation proposePrice(ProposePriceRequest request, String processServerId) {
        log.info("PS {} proposing price {} for recipient {}", processServerId, request.getProposedAmount(), 
                 request.getOrderRecipientId());

        // 1. Validate recipient exists and is GUIDED and ASSIGNED
        OrderRecipient recipient = recipientRepository.findById(request.getOrderRecipientId())
                .orElseThrow(() -> new RuntimeException("Recipient not found: " + request.getOrderRecipientId()));

        if (!recipient.getRecipientType().equals(OrderRecipient.RecipientType.GUIDED)) {
            throw new RuntimeException("Can only propose prices for GUIDED recipients");
        }

        if (!recipient.getStatus().equals(OrderRecipient.RecipientStatus.ASSIGNED)) {
            throw new RuntimeException("Recipient must be in ASSIGNED status to propose price");
        }

        // 2. Validate PS is the assigned process server
        if (!processServerId.equals(recipient.getAssignedProcessServerId())) {
            throw new RuntimeException("Only assigned process server can propose price");
        }

        // 3. Reject any active PENDING negotiation first
        negotiationRepository.findByOrderRecipientIdAndStatus(
                request.getOrderRecipientId(), 
                PriceNegotiation.NegotiationStatus.PENDING
        ).ifPresent(existing -> {
            existing.setStatus(PriceNegotiation.NegotiationStatus.REJECTED);
            existing.setRejectedAt(LocalDateTime.now());
            negotiationRepository.save(existing);
        });

        // 4. Create new negotiation
        PriceNegotiation negotiation = new PriceNegotiation();
        negotiation.setId(UUID.randomUUID().toString());
        negotiation.setRecipient(recipient);
        negotiation.setProposedBy(PriceNegotiation.Party.PROCESS_SERVER);
        negotiation.setProposedAmount(request.getProposedAmount());
        negotiation.setStatus(PriceNegotiation.NegotiationStatus.PENDING);
        negotiation.setProposerNotes(request.getNotes());
        negotiation.setNegotiationRounds(0);
        negotiation.setProposedAt(LocalDateTime.now());

        negotiation = negotiationRepository.save(negotiation);

        // 5. Update recipient negotiation tracking
        recipient.setQuotedPrice(request.getProposedAmount()); // Store proposal in quotedPrice
        recipient.setNegotiationStatus("PENDING_COUNTER");
        recipient.setActiveNegotiationId(negotiation.getId());
        recipient.setLastNegotiationAt(LocalDateTime.now());
        recipientRepository.save(recipient);

        log.info("Price proposal created: {} with amount {}", negotiation.getId(), request.getProposedAmount());
        return negotiation;
    }

    /**
     * Customer submits a counter-offer to PS proposal
     */
    @Transactional
    public PriceNegotiation submitCounterOffer(CounterOfferRequest request, String customerId) {
        log.info("Customer {} submitting counter-offer {} for negotiation {}", customerId, 
                 request.getCounterOfferAmount(), request.getNegotiationId());

        // 1. Validate negotiation exists and is PENDING
        PriceNegotiation negotiation = negotiationRepository.findById(request.getNegotiationId())
                .orElseThrow(() -> new RuntimeException("Negotiation not found: " + request.getNegotiationId()));

        if (!negotiation.getStatus().equals(PriceNegotiation.NegotiationStatus.PENDING)) {
            throw new RuntimeException("Can only counter-offer on PENDING negotiations");
        }

        if (!negotiation.getProposedBy().equals(PriceNegotiation.Party.PROCESS_SERVER)) {
            throw new RuntimeException("This negotiation is not awaiting customer counter-offer");
        }

        // 2. Validate customer owns the order
        OrderRecipient recipient = negotiation.getRecipient();
        Order order = recipient.getOrder();
        if (!order.getCustomerId().equals(customerId)) {
            throw new RuntimeException("Unauthorized: not the order owner");
        }

        // 3. Update negotiation with counter-offer
        negotiation.setCounterOfferAmount(request.getCounterOfferAmount());
        negotiation.setCounterOfferedBy(PriceNegotiation.Party.CUSTOMER);
        negotiation.setResponderNotes(request.getNotes());
        negotiation.setCounterOfferedAt(LocalDateTime.now());
        negotiation.setNegotiationRounds(negotiation.getNegotiationRounds() + 1);

        negotiation = negotiationRepository.save(negotiation);

        // 4. Update recipient status
        recipient.setNegotiationStatus("PENDING_PROPOSAL"); // Now waiting for PS to accept/reject
        recipient.setLastNegotiationAt(LocalDateTime.now());
        recipientRepository.save(recipient);

        log.info("Counter-offer submitted: {} with amount {}", negotiation.getId(), request.getCounterOfferAmount());
        return negotiation;
    }

    /**
     * Accept current offer (either original proposal or latest counter-offer)
     */
    @Transactional
    public PriceNegotiation acceptNegotiation(AcceptNegotiationRequest request, String userId, boolean isProcessServer) {
        log.info("User {} accepting negotiation {}", userId, request.getNegotiationId());

        // 1. Validate negotiation exists and is PENDING
        PriceNegotiation negotiation = negotiationRepository.findById(request.getNegotiationId())
                .orElseThrow(() -> new RuntimeException("Negotiation not found: " + request.getNegotiationId()));

        if (!negotiation.getStatus().equals(PriceNegotiation.NegotiationStatus.PENDING)) {
            throw new RuntimeException("Can only accept PENDING negotiations");
        }

        OrderRecipient recipient = negotiation.getRecipient();
        Order order = recipient.getOrder();

        // 2. Validate permissions
        if (isProcessServer) {
            if (!userId.equals(recipient.getAssignedProcessServerId())) {
                throw new RuntimeException("Unauthorized: not the assigned process server");
            }
            // PS can accept if: customer made a counter-offer OR customer accepted PS's original proposal
            if (negotiation.getCounterOfferedBy() == null || 
                !negotiation.getCounterOfferedBy().equals(PriceNegotiation.Party.CUSTOMER)) {
                throw new RuntimeException("Process server can only accept customer counter-offers");
            }
        } else {
            if (!userId.equals(order.getCustomerId())) {
                throw new RuntimeException("Unauthorized: not the order owner");
            }
            // Customer can only accept PS proposals (original or counter)
            if (!negotiation.getProposedBy().equals(PriceNegotiation.Party.PROCESS_SERVER)) {
                throw new RuntimeException("Customer can only accept PS proposals");
            }
        }

        // 3. Determine agreed amount (customer counter-offer if exists, else PS proposal)
        BigDecimal agreedAmount = negotiation.getCounterOfferAmount() != null 
                ? negotiation.getCounterOfferAmount() 
                : negotiation.getProposedAmount();

        // 4. Update negotiation
        negotiation.setStatus(PriceNegotiation.NegotiationStatus.ACCEPTED);
        negotiation.setAcceptedAt(LocalDateTime.now());
        negotiation = negotiationRepository.save(negotiation);

        // 5. Update recipient with final agreed price
        // The agreed amount is for the BASE service, need to add rush and remote fees
        BigDecimal rushFee = recipient.getRushService() ? new BigDecimal("50") : BigDecimal.ZERO;
        BigDecimal remoteFee = recipient.getRemoteLocation() ? new BigDecimal("40") : BigDecimal.ZERO;
        BigDecimal totalPrice = agreedAmount.add(rushFee).add(remoteFee);
        
        recipient.setFinalAgreedPrice(totalPrice);
        recipient.setNegotiationStatus("ACCEPTED");
        recipient.setLastNegotiationAt(LocalDateTime.now());
        recipientRepository.save(recipient);

        // 6. Recalculate order totals
        recalculateOrderTotals(order);

        log.info("Negotiation accepted: {} with base amount {} and total price {} (including rush: {}, remote: {})", 
                 negotiation.getId(), agreedAmount, totalPrice, rushFee, remoteFee);
        return negotiation;
    }

    /**
     * Reject negotiation and keep original pricing
     */
    @Transactional
    public PriceNegotiation rejectNegotiation(RejectNegotiationRequest request, String userId, boolean isProcessServer) {
        log.info("User {} rejecting negotiation {}", userId, request.getNegotiationId());

        // 1. Validate negotiation exists and is PENDING
        PriceNegotiation negotiation = negotiationRepository.findById(request.getNegotiationId())
                .orElseThrow(() -> new RuntimeException("Negotiation not found: " + request.getNegotiationId()));

        if (!negotiation.getStatus().equals(PriceNegotiation.NegotiationStatus.PENDING)) {
            throw new RuntimeException("Can only reject PENDING negotiations");
        }

        OrderRecipient recipient = negotiation.getRecipient();
        Order order = recipient.getOrder();

        // 2. Validate permissions
        if (isProcessServer) {
            if (!userId.equals(recipient.getAssignedProcessServerId())) {
                throw new RuntimeException("Unauthorized: not the assigned process server");
            }
            // PS can reject customer counter-offers
            if (negotiation.getCounterOfferedBy() == null ||
                !negotiation.getCounterOfferedBy().equals(PriceNegotiation.Party.CUSTOMER)) {
                throw new RuntimeException("Process server can only reject customer counter-offers");
            }
        } else {
            if (!userId.equals(order.getCustomerId())) {
                throw new RuntimeException("Unauthorized: not the order owner");
            }
            // Customer can only reject PS proposals
            if (!negotiation.getProposedBy().equals(PriceNegotiation.Party.PROCESS_SERVER)) {
                throw new RuntimeException("Customer can only reject PS proposals");
            }
        }

        // 3. Update negotiation
        negotiation.setStatus(PriceNegotiation.NegotiationStatus.REJECTED);
        negotiation.setRejectedAt(LocalDateTime.now());
        negotiation.setResponderNotes(request.getReason());
        negotiation = negotiationRepository.save(negotiation);

        // 4. Update recipient status back to ASSIGNED (allow reassignment if customer rejected)
        recipient.setNegotiationStatus("REJECTED");
        recipient.setLastNegotiationAt(LocalDateTime.now());
        recipient.setActiveNegotiationId(null);
        
        // If customer rejected PS proposal, allow reassignment
        if (!isProcessServer) {
            recipient.setStatus(OrderRecipient.RecipientStatus.OPEN); // Allow reassignment
        }
        
        recipientRepository.save(recipient);

        log.info("Negotiation rejected: {} by {}", negotiation.getId(), isProcessServer ? "PS" : "Customer");
        return negotiation;
    }

    /**
     * Get negotiation history for a recipient
     */
    public List<PriceNegotiation> getNegotiationHistory(String orderRecipientId) {
        return negotiationRepository.findByOrderRecipientId(orderRecipientId);
    }

    /**
     * Get current active negotiation for a recipient
     */
    public PriceNegotiation getActiveNegotiation(String orderRecipientId) {
        return negotiationRepository.findByOrderRecipientIdAndStatus(
                orderRecipientId,
                PriceNegotiation.NegotiationStatus.PENDING
        ).orElse(null);
    }

    /**
     * Recalculate order totals after price negotiation is accepted
     */
    @Transactional
    private void recalculateOrderTotals(Order order) {
        log.debug("Recalculating order totals for order: {}", order.getId());

        BigDecimal totalProcessServerPayout = BigDecimal.ZERO;
        BigDecimal totalCustomerPayment = BigDecimal.ZERO;
        BigDecimal totalSuperAdminFee = BigDecimal.ZERO;
        BigDecimal totalTenantProfit = BigDecimal.ZERO;

        // Recalculate for each recipient
        for (OrderRecipient recipient : order.getRecipients()) {
            if (recipient.getRecipientType().equals(OrderRecipient.RecipientType.GUIDED)) {
                BigDecimal basePrice = recipient.getFinalAgreedPrice();
                BigDecimal commission = basePrice.multiply(new BigDecimal("0.15"));
                BigDecimal totalCustomerPay = basePrice.add(commission);
                BigDecimal superAdminFee = commission.multiply(new BigDecimal("0.05"));
                BigDecimal tenantProfit = commission.subtract(superAdminFee);

                totalProcessServerPayout = totalProcessServerPayout.add(basePrice);
                totalCustomerPayment = totalCustomerPayment.add(totalCustomerPay);
                totalSuperAdminFee = totalSuperAdminFee.add(superAdminFee);
                totalTenantProfit = totalTenantProfit.add(tenantProfit);
            }
        }

        order.setProcessServerPayout(totalProcessServerPayout);
        order.setCustomerPaymentAmount(totalCustomerPayment);
        order.setSuperAdminFee(totalSuperAdminFee);
        order.setTenantProfit(totalTenantProfit);
        order.setTenantCommission(totalSuperAdminFee.add(totalTenantProfit)); // Total commission
        
        orderRepository.save(order);
        log.debug("Order totals recalculated. Customer: {}, PS Payout: {}", totalCustomerPayment, totalProcessServerPayout);
    }
}
