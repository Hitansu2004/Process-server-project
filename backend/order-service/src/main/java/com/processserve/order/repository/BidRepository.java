package com.processserve.order.repository;

import com.processserve.order.entity.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BidRepository extends JpaRepository<Bid, String> {

        @Query(value = "SELECT b.* FROM bids b JOIN order_recipients d ON b.order_recipient_id = d.id WHERE d.order_id = :orderId", nativeQuery = true)
        List<Bid> findByRecipientOrderId(@Param("orderId") String orderId);

        @Query(value = "SELECT * FROM bids WHERE order_recipient_id = :orderRecipientId", nativeQuery = true)
        List<Bid> findByOrderRecipientId(@Param("orderRecipientId") String orderRecipientId);

        @Query(value = "SELECT * FROM bids WHERE process_server_id = :processServerId", nativeQuery = true)
        List<Bid> findByProcessServerId(@Param("processServerId") String processServerId);

        @Query(value = "SELECT b.* FROM bids b JOIN order_recipients d ON b.order_recipient_id = d.id WHERE d.order_id = :orderId AND b.status = :#{#status.name()}", nativeQuery = true)
        List<Bid> findByRecipientOrderIdAndStatus(@Param("orderId") String orderId,
                        @Param("status") Bid.BidStatus status);

        @Query(value = "SELECT * FROM bids WHERE order_recipient_id = :orderRecipientId AND status = :#{#status.name()}", nativeQuery = true)
        List<Bid> findByOrderRecipientIdAndStatus(@Param("orderRecipientId") String orderRecipientId,
                        @Param("status") Bid.BidStatus status);

        @Query(value = "SELECT b.* FROM bids b JOIN order_recipients d ON b.order_recipient_id = d.id WHERE d.order_id = :orderId AND b.process_server_id = :processServerId", nativeQuery = true)
        Optional<Bid> findByRecipientOrderIdAndProcessServerId(@Param("orderId") String orderId,
                        @Param("processServerId") String processServerId);

        @Query(value = "SELECT COUNT(*) > 0 FROM bids b JOIN order_recipients d ON b.order_recipient_id = d.id WHERE d.order_id = :orderId AND b.process_server_id = :processServerId", nativeQuery = true)
        boolean existsByRecipientOrderIdAndProcessServerId(@Param("orderId") String orderId,
                        @Param("processServerId") String processServerId);
}
