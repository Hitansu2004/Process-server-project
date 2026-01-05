package com.processserve.user.service;

import com.processserve.user.entity.ContactBookEntry;
import com.processserve.user.entity.UserInvitation;
import com.processserve.user.repository.ContactBookEntryRepository;
import com.processserve.user.repository.UserInvitationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvitationService {

    private final UserInvitationRepository invitationRepository;
    private final ContactBookEntryRepository contactBookRepository;
    private final RestTemplate restTemplate;

    @Transactional
    public UserInvitation createInvitation(String invitedByUserId, String invitedEmail, String firstName,
            String lastName, String tenantId, UserInvitation.UserRole role) {
        log.info("Creating invitation from user {} to {}", invitedByUserId, invitedEmail);

        // Check if active invitation already exists
        if (invitationRepository.existsByInvitedEmailAndTenantIdAndInvitationStatus(
                invitedEmail, tenantId, UserInvitation.InvitationStatus.PENDING)) {
            throw new RuntimeException("Active invitation already exists for this email in this tenant");
        }

        // Create invitation
        UserInvitation invitation = new UserInvitation();
        invitation.setId(UUID.randomUUID().toString());
        invitation.setInvitedByUserId(invitedByUserId);
        invitation.setInvitedEmail(invitedEmail);
        invitation.setFirstName(firstName);
        invitation.setLastName(lastName);
        invitation.setTenantId(tenantId);
        invitation.setRole(role);
        invitation.setInvitationStatus(UserInvitation.InvitationStatus.PENDING);
        // expiresAt is set automatically in @PrePersist to current time + 3 days

        invitation = invitationRepository.save(invitation);

        // Create NOT_ACTIVATED contact entry
        ContactBookEntry contactEntry = new ContactBookEntry();
        contactEntry.setId(UUID.randomUUID().toString());
        contactEntry.setOwnerUserId(invitedByUserId);
        contactEntry.setProcessServerId(invitedEmail); // Temporarily use email as process server ID
        contactEntry.setEntryType(ContactBookEntry.EntryType.MANUAL);
        contactEntry.setActivationStatus(ContactBookEntry.ActivationStatus.NOT_ACTIVATED);
        contactEntry.setInvitationId(invitation.getId());
        String nickname;
        if ((firstName == null || firstName.trim().isEmpty()) && (lastName == null || lastName.trim().isEmpty())) {
            // Fallback to email prefix if names are missing
            nickname = invitedEmail.split("@")[0];
        } else {
            nickname = (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "");
            nickname = nickname.trim();
        }
        contactEntry.setNickname(nickname);

        contactBookRepository.save(contactEntry);

        log.info("Invitation created successfully: {}", invitation.getId());

        // TODO: Send invitation email via notification service
        sendInvitationEmail(invitation);

        return invitation;
    }

    @Transactional
    public UserInvitation activateInvitation(String email, String tenantId, String processServerId) {
        log.info("Activating invitation for email: {} in tenant: {}", email, tenantId);

        UserInvitation invitation = invitationRepository
                .findActivePendingInvitationByEmail(email, LocalDateTime.now())
                .orElse(null);

        if (invitation == null) {
            log.warn("No active invitation found for email: {}", email);
            return null;
        }

        // Update invitation status
        invitation.setInvitationStatus(UserInvitation.InvitationStatus.ACCEPTED);
        invitation.setActivatedAt(LocalDateTime.now());
        invitationRepository.save(invitation);

        // Update contact book entry to ACTIVATED status and set real process server ID
        List<ContactBookEntry> contactEntries = contactBookRepository.findByInvitationId(invitation.getId());
        for (ContactBookEntry entry : contactEntries) {
            entry.setActivationStatus(ContactBookEntry.ActivationStatus.ACTIVATED);
            entry.setProcessServerId(processServerId); // Update with real process server profile ID
            contactBookRepository.save(entry);
        }

        log.info("Invitation activated successfully: {}", invitation.getId());

        return invitation;
    }

    public UserInvitation getInvitationByEmail(String email, String tenantId) {
        return invitationRepository.findByInvitedEmailAndTenantId(email, tenantId).orElse(null);
    }

    public UserInvitation getActivePendingInvitation(String email) {
        return invitationRepository.findActivePendingInvitationByEmail(email, LocalDateTime.now()).orElse(null);
    }

    public List<UserInvitation> getInvitationsByUser(String userId) {
        return invitationRepository.findByInvitedByUserId(userId);
    }

    // Scheduled job to clean up expired invitations
    @Scheduled(cron = "0 0 */6 * * *") // Run every 6 hours
    @Transactional
    public void cleanupExpiredInvitations() {
        log.info("Running scheduled cleanup of expired invitations");

        List<UserInvitation> expiredInvitations = invitationRepository.findExpiredInvitations(LocalDateTime.now());

        for (UserInvitation invitation : expiredInvitations) {
            log.info("Processing expired invitation: {}", invitation.getId());

            // Update status to EXPIRED
            invitation.setInvitationStatus(UserInvitation.InvitationStatus.EXPIRED);
            invitationRepository.save(invitation);

            // Delete associated contact entries (cascade will handle this via FK
            // constraint)
            // But we also need to delete associated orders from order-service
            try {
                deleteOrdersForExpiredInvitation(invitation.getId());
            } catch (Exception e) {
                log.error("Failed to delete orders for expired invitation: {}", invitation.getId(), e);
            }

            // Now delete the contact entries manually for logging
            List<ContactBookEntry> contactEntries = contactBookRepository.findByInvitationId(invitation.getId());
            for (ContactBookEntry contactEntry : contactEntries) {
                log.info("Deleting contact entry: {} for expired invitation", contactEntry.getId());
                contactBookRepository.delete(contactEntry);
            }
        }

        log.info("Cleaned up {} expired invitations", expiredInvitations.size());
    }

    private void deleteOrdersForExpiredInvitation(String invitationId) {
        try {
            // Call order-service to delete orders assigned to this invitation
            List<ContactBookEntry> entries = contactBookRepository.findByInvitationId(invitationId);
            for (ContactBookEntry entry : entries) {
                String url = "http://ORDER-SERVICE/api/orders/invitation/" + invitationId + "/cleanup";
                restTemplate.delete(url);
                log.info("Deleted orders for invitation: {}", invitationId);
            }
        } catch (Exception e) {
            log.error("Failed to delete orders for invitation: {}", invitationId, e);
        }
    }

    private void sendInvitationEmail(UserInvitation invitation) {
        try {
            // TODO: Integrate with notification service to send invitation email
            String registrationLink = "http://localhost:3004/register?email=" + invitation.getInvitedEmail()
                    + "&tenant=" + invitation.getTenantId();
            log.info("TODO: Send invitation email to: {}. Link: {}", invitation.getInvitedEmail(), registrationLink);
        } catch (Exception e) {
            log.error("Failed to send invitation email", e);
        }
    }
}
