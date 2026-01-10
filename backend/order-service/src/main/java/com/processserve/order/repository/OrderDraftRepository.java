package com.processserve.order.repository;

import com.processserve.order.model.OrderDraft;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderDraftRepository extends JpaRepository<OrderDraft, String> {

    /**
     * Find all drafts for a specific customer
     */
    List<OrderDraft> findByCustomerIdOrderByUpdatedAtDesc(String customerId);

    /**
     * Find the most recent draft for a customer
     */
    Optional<OrderDraft> findFirstByCustomerIdOrderByUpdatedAtDesc(String customerId);

    /**
     * Find expired drafts for cleanup
     */
    @Query("SELECT d FROM OrderDraft d WHERE d.expiresAt < :now")
    List<OrderDraft> findExpiredDrafts(LocalDateTime now);

    /**
     * Count drafts for a customer
     */
    long countByCustomerId(String customerId);

    /**
     * Delete drafts for a customer
     */
    void deleteByCustomerId(String customerId);
}
