package com.processserve.user.repository;

import com.processserve.user.entity.CustomerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, String> {

        @Query(value = "SELECT cp.* FROM customer_profiles cp " +
                        "JOIN tenant_user_roles tur ON cp.tenant_user_role_id = tur.id " +
                        "WHERE tur.global_user_id = :globalUserId", nativeQuery = true)
        Optional<CustomerProfile> findByGlobalUserId(
                        @Param("globalUserId") String globalUserId);

        Optional<CustomerProfile> findByTenantUserRoleId(String tenantUserRoleId);
}
