package com.processserve.user.repository;

import com.processserve.user.entity.TenantUserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TenantUserRoleRepository extends JpaRepository<TenantUserRole, String> {
}
