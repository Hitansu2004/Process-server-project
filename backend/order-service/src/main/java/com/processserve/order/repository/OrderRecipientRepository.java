package com.processserve.order.repository;

import com.processserve.order.entity.OrderRecipient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRecipientRepository extends JpaRepository<OrderRecipient, String> {

    List<OrderRecipient> findByOrderId(String orderId);
}
