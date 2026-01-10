package com.processserve.order.repository;

import com.processserve.order.model.OrderDraftData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderDraftDataRepository extends JpaRepository<OrderDraftData, String> {

    /**
     * Find draft data by draft ID
     */
    Optional<OrderDraftData> findByDraftId(String draftId);

    /**
     * Delete draft data by draft ID
     */
    void deleteByDraftId(String draftId);
}
