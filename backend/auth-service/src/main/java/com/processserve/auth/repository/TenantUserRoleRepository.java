package com.processserve.auth.repository;

import com.processserve.auth.entity.TenantUserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TenantUserRoleRepository extends JpaRepository<TenantUserRole, String> {

    List<TenantUserRole> findByGlobalUserId(String globalUserId);

    List<TenantUserRole> findByGlobalUserIdAndIsActive(String globalUserId, Boolean isActive);
}
