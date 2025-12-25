package com.processserve.order.repository;

import com.processserve.order.entity.ChatParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, String> {

    @Query("SELECT cp FROM ChatParticipant cp WHERE cp.orderId = :orderId AND cp.isActive = true")
    List<ChatParticipant> findActiveParticipantsByOrder(@Param("orderId") String orderId);

    @Query("SELECT cp FROM ChatParticipant cp WHERE cp.orderId = :orderId AND cp.userId = :userId AND cp.isActive = true")
    Optional<ChatParticipant> findActiveParticipantByOrderAndUser(@Param("orderId") String orderId,
            @Param("userId") String userId);

    @Query("SELECT cp FROM ChatParticipant cp WHERE cp.orderId = :orderId AND cp.userId = :userId AND cp.userRole = :userRole")
    Optional<ChatParticipant> findByOrderUserAndRole(@Param("orderId") String orderId, @Param("userId") String userId,
            @Param("userRole") ChatParticipant.UserRole userRole);
}
