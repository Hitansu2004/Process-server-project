package com.processserve.order.repository;

import com.processserve.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {

    List<Order> findByTenantId(String tenantId);

    List<Order> findByCustomerId(String customerId);

    List<Order> findDistinctByDropoffsAssignedProcessServerId(String processServerId);

    Optional<Order> findByOrderNumber(String orderNumber);

    @Query("SELECT DISTINCT o FROM Order o JOIN o.dropoffs d WHERE d.assignedProcessServerId = :processServerId ORDER BY o.completedAt DESC")
    List<Order> findTop15ByAssignedProcessServerIdOrderByCompletedAtDesc(
            @Param("processServerId") String processServerId);

    List<Order> findByTenantIdAndStatus(String tenantId, Order.OrderStatus status);

    long countByCustomerId(String customerId);

    Optional<Order> findTopByCustomerIdOrderByCreatedAtDesc(String customerId);

    // Requirement 5: Case Object Searchability
    List<Order> findByCaseNumber(String caseNumber);

    List<Order> findByJurisdiction(String jurisdiction);

    List<Order> findByCaseNumberAndJurisdiction(String caseNumber, String jurisdiction);

    @Query("SELECT o FROM Order o WHERE o.caseNumber LIKE %:query% OR o.jurisdiction LIKE %:query%")
    List<Order> searchByCaseInfo(@Param("query") String query);
}
