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

        @Query(value = "SELECT b.* FROM bids b JOIN order_dropoffs d ON b.order_dropoff_id = d.id WHERE d.order_id = :orderId", nativeQuery = true)
        List<Bid> findByDropoffOrderId(@Param("orderId") String orderId);

        @Query(value = "SELECT * FROM bids WHERE order_dropoff_id = :orderDropoffId", nativeQuery = true)
        List<Bid> findByOrderDropoffId(@Param("orderDropoffId") String orderDropoffId);

        @Query(value = "SELECT * FROM bids WHERE process_server_id = :processServerId", nativeQuery = true)
        List<Bid> findByProcessServerId(@Param("processServerId") String processServerId);

        @Query(value = "SELECT b.* FROM bids b JOIN order_dropoffs d ON b.order_dropoff_id = d.id WHERE d.order_id = :orderId AND b.status = :#{#status.name()}", nativeQuery = true)
        List<Bid> findByDropoffOrderIdAndStatus(@Param("orderId") String orderId,
                        @Param("status") Bid.BidStatus status);

        @Query(value = "SELECT * FROM bids WHERE order_dropoff_id = :orderDropoffId AND status = :#{#status.name()}", nativeQuery = true)
        List<Bid> findByOrderDropoffIdAndStatus(@Param("orderDropoffId") String orderDropoffId,
                        @Param("status") Bid.BidStatus status);

        @Query(value = "SELECT b.* FROM bids b JOIN order_dropoffs d ON b.order_dropoff_id = d.id WHERE d.order_id = :orderId AND b.process_server_id = :processServerId", nativeQuery = true)
        Optional<Bid> findByDropoffOrderIdAndProcessServerId(@Param("orderId") String orderId,
                        @Param("processServerId") String processServerId);

        @Query(value = "SELECT COUNT(*) > 0 FROM bids b JOIN order_dropoffs d ON b.order_dropoff_id = d.id WHERE d.order_id = :orderId AND b.process_server_id = :processServerId", nativeQuery = true)
        boolean existsByDropoffOrderIdAndProcessServerId(@Param("orderId") String orderId,
                        @Param("processServerId") String processServerId);
}
