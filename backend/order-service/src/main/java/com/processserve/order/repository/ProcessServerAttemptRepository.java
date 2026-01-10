package com.processserve.order.repository;

import com.processserve.order.entity.ProcessServerAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProcessServerAttemptRepository extends JpaRepository<ProcessServerAttempt, String> {
    List<ProcessServerAttempt> findByRecipientId(String recipientId);

    List<ProcessServerAttempt> findByProcessServerId(String processServerId);
}
