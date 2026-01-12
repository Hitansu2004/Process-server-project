package com.processserve.order.repository;

import com.processserve.order.entity.OrderDraft;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderDraftRepository extends JpaRepository<OrderDraft, String> {
    
    List<OrderDraft> findByCustomerIdOrderByUpdatedAtDesc(String customerId);
    
    List<OrderDraft> findByTenantIdOrderByUpdatedAtDesc(String tenantId);
    
    Optional<OrderDraft> findFirstByCustomerIdOrderByUpdatedAtDesc(String customerId);
    
    // Clean up expired drafts
    List<OrderDraft> findByExpiresAtBefore(LocalDateTime dateTime);
    
    void deleteByExpiresAtBefore(LocalDateTime dateTime);
    
    long countByCustomerId(String customerId);
}
