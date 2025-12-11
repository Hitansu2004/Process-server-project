package com.processserve.user.repository;

import com.processserve.user.entity.ProcessServerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProcessServerRepository extends JpaRepository<ProcessServerProfile, String> {

    Optional<ProcessServerProfile> findByTenantUserRoleId(String tenantUserRoleId);

    List<ProcessServerProfile> findByStatus(ProcessServerProfile.ProcessServerStatus status);

    List<ProcessServerProfile> findByTenantId(String tenantId);

    List<ProcessServerProfile> findByIsGlobal(Boolean isGlobal);

    List<ProcessServerProfile> findByTenantIdAndIsGlobal(String tenantId, Boolean isGlobal);

    // Assuming isApproved is removed or mapped to status, but entity didn't have
    // isApproved field in my update?
    // Wait, I removed isApproved from entity in previous step because schema didn't
    // have it (it has status PENDING_APPROVAL).
    // So I should remove findByIsApproved or change it to
    // findByStatus(PENDING_APPROVAL).
    // I'll remove it and let service use findByStatus.
}
