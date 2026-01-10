package com.processserve.order.repository;

import com.processserve.order.entity.OrderHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderHistoryRepository extends JpaRepository<OrderHistory, String> {

    List<OrderHistory> findByOrderIdOrderByCreatedAtDesc(String orderId);

    List<OrderHistory> findByRecipientIdOrderByCreatedAtDesc(String recipientId);

    List<OrderHistory> findByOrderIdAndChangeTypeOrderByCreatedAtDesc(String orderId, String changeType);
}
