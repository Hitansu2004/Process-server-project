package com.processserve.user.repository;

import com.processserve.user.entity.UserInvitation;
import com.processserve.user.entity.UserInvitation.InvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserInvitationRepository extends JpaRepository<UserInvitation, String> {

    Optional<UserInvitation> findByInvitedEmailAndTenantId(String invitedEmail, String tenantId);

    List<UserInvitation> findByInvitedByUserId(String invitedByUserId);

    List<UserInvitation> findByInvitationStatus(InvitationStatus status);

    @Query("SELECT i FROM UserInvitation i WHERE i.invitationStatus = 'PENDING' AND i.expiresAt < :now")
    List<UserInvitation> findExpiredInvitations(LocalDateTime now);

    @Query("SELECT i FROM UserInvitation i WHERE i.invitedEmail = :email AND i.invitationStatus = 'PENDING' AND i.expiresAt > :now")
    Optional<UserInvitation> findActivePendingInvitationByEmail(String email, LocalDateTime now);

    boolean existsByInvitedEmailAndTenantIdAndInvitationStatus(String invitedEmail, String tenantId,
            InvitationStatus status);
}
