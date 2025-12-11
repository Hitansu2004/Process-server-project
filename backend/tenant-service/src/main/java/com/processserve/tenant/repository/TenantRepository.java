package com.processserve.tenant.repository;

import com.processserve.tenant.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, String> {
    Optional<Tenant> findByDomainUrl(String domainUrl);

    Optional<Tenant> findByApiKey(String apiKey);

    boolean existsByName(String name);
}
