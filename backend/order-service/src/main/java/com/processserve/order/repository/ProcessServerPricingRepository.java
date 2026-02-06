package com.processserve.order.repository;

import com.processserve.order.entity.ProcessServerPricing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for ProcessServerPricing entity.
 * 
 * Query Strategy:
 * - Find exact zip code match first
 * - Fall back to zip_code='ALL' for default pricing
 * - Each row contains all 4 service fees (process, certified mail, rush, remote)
 */
@Repository
public interface ProcessServerPricingRepository extends JpaRepository<ProcessServerPricing, String> {

    /**
     * Find all active pricing rules for a process server
     */
    List<ProcessServerPricing> findByProcessServerIdAndIsActiveTrue(String processServerId);

    /**
     * Find all pricing rules for a process server (including inactive)
     */
    List<ProcessServerPricing> findByProcessServerId(String processServerId);

    /**
     * Find pricing for a specific zip code
     */
    Optional<ProcessServerPricing> findByProcessServerIdAndZipCodeAndIsActiveTrue(
        String processServerId, 
        String zipCode
    );

    /**
     * Find default pricing (where zip_code = 'ALL')
     */
    @Query("SELECT p FROM ProcessServerPricing p WHERE p.processServerId = :processServerId " +
           "AND p.zipCode = 'ALL' AND p.isActive = true")
    Optional<ProcessServerPricing> findDefaultPricing(@Param("processServerId") String processServerId);

    /**
     * Find pricing for a zip code with fallback to default.
     * First tries to find exact match, then falls back to 'ALL'
     */
    @Query("SELECT p FROM ProcessServerPricing p WHERE p.processServerId = :processServerId " +
           "AND p.isActive = true AND p.zipCode IN (:zipCode, 'ALL') " +
           "ORDER BY CASE WHEN p.zipCode = :zipCode THEN 0 ELSE 1 END")
    List<ProcessServerPricing> findByZipCodeWithFallback(
        @Param("processServerId") String processServerId,
        @Param("zipCode") String zipCode
    );

    /**
     * Delete all pricing rules for a process server
     */
    void deleteByProcessServerId(String processServerId);

    /**
     * Count active pricing rules for a process server
     */
    long countByProcessServerIdAndIsActiveTrue(String processServerId);

    /**
     * Check if process server has custom pricing configured
     */
    boolean existsByProcessServerIdAndIsActiveTrue(String processServerId);
}
