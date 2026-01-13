package com.processserve.order.repository;

import com.processserve.order.entity.OrderDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderDocumentRepository extends JpaRepository<OrderDocument, String> {
    
    /**
     * Find all documents for a specific order, ordered by display_order
     */
    List<OrderDocument> findByOrderIdOrderByDisplayOrderAsc(String orderId);
    
    /**
     * Count documents for a specific order
     */
    long countByOrderId(String orderId);
    
    /**
     * Delete all documents for a specific order
     */
    void deleteByOrderId(String orderId);
}
