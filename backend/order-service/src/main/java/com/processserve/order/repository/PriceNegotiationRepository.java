package com.processserve.order.repository;

import com.processserve.order.entity.PriceNegotiation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PriceNegotiationRepository extends JpaRepository<PriceNegotiation, String> {
    
    // Find all negotiations for a recipient
    List<PriceNegotiation> findByOrderRecipientId(String orderRecipientId);
    
    // Find active (PENDING) negotiation for a recipient
    Optional<PriceNegotiation> findByOrderRecipientIdAndStatus(String orderRecipientId, PriceNegotiation.NegotiationStatus status);
    
    // Find all negotiations by status
    List<PriceNegotiation> findByStatus(PriceNegotiation.NegotiationStatus status);
    
    // Find most recent negotiation for a recipient
    Optional<PriceNegotiation> findFirstByOrderRecipientIdOrderByCreatedAtDesc(String orderRecipientId);
}
