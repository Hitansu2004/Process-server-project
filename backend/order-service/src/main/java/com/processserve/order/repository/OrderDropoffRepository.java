package com.processserve.order.repository;

import com.processserve.order.entity.OrderDropoff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderDropoffRepository extends JpaRepository<OrderDropoff, String> {

    List<OrderDropoff> findByOrderId(String orderId);
}
