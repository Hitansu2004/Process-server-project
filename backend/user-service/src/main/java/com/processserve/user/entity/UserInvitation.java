package com.processserve.user.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_invitations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserInvitation {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "invited_by_user_id", length = 36, nullable = false)
    private String invitedByUserId;

    @Column(name = "invited_email", nullable = false)
    private String invitedEmail;

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(name = "invitation_status", nullable = false)
    private InvitationStatus invitationStatus = InvitationStatus.PENDING;

    @Column(name = "tenant_id", length = 36, nullable = false)
    private String tenantId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role = UserRole.PROCESS_SERVER;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "activated_at")
    private LocalDateTime activatedAt;

    public enum InvitationStatus {
        PENDING, ACCEPTED, EXPIRED
    }

    public enum UserRole {
        CUSTOMER, PROCESS_SERVER
    }

    @PrePersist
    public void onCreate() {
        if (expiresAt == null) {
            // Set expiration to 3 days from now
            expiresAt = LocalDateTime.now().plusDays(3);
        }
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt) && invitationStatus == InvitationStatus.PENDING;
    }
}
