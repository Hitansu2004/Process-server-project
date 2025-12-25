package com.processserve.order.repository;

import com.processserve.order.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, String> {

    @Query("SELECT m FROM Message m WHERE m.orderId = :orderId ORDER BY m.createdAt ASC")
    List<Message> findByOrderIdOrderByCreatedAtAsc(@Param("orderId") String orderId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.orderId = :orderId AND m.isRead = false AND m.senderId != :userId")
    long countUnreadMessagesByOrderAndUser(@Param("orderId") String orderId, @Param("userId") String userId);

    @Query("SELECT m FROM Message m WHERE m.orderId = :orderId AND m.isRead = false")
    List<Message> findUnreadMessagesByOrder(@Param("orderId") String orderId);
}
