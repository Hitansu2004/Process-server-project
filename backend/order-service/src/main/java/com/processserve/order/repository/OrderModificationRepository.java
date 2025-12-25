package com.processserve.order.repository;

import com.processserve.order.entity.OrderModification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderModificationRepository extends JpaRepository<OrderModification, String> {

    // Find all modifications for a specific order
    List<OrderModification> findByOrderIdOrderByModifiedAtDesc(String orderId);

    // Count modifications for an order
    long countByOrderId(String orderId);

    // Find modifications by user
    List<OrderModification> findByModifiedByUserIdOrderByModifiedAtDesc(String userId);
}
