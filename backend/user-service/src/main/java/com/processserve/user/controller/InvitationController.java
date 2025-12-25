package com.processserve.user.controller;

import com.processserve.user.entity.UserInvitation;
import com.processserve.user.service.InvitationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class InvitationController {

    private final InvitationService invitationService;

    @PostMapping
    public ResponseEntity<?> createInvitation(@RequestBody Map<String, Object> request) {
        try {
            String invitedByUserId = (String) request.get("invitedByUserId");
            String invitedEmail = (String) request.get("invitedEmail");
            String firstName = (String) request.get("firstName");
            String lastName = (String) request.get("lastName");
            String tenantId = (String) request.get("tenantId");
            String roleStr = (String) request.getOrDefault("role", "PROCESS_SERVER");

            UserInvitation.UserRole role = UserInvitation.UserRole.valueOf(roleStr);

            UserInvitation invitation = invitationService.createInvitation(
                    invitedByUserId, invitedEmail, firstName, lastName, tenantId, role);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Invitation sent successfully",
                    "invitation", invitation));
        } catch (Exception e) {
            log.error("Failed to create invitation", e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserInvitation>> getInvitationsByUser(@PathVariable String userId) {
        try {
            List<UserInvitation> invitations = invitationService.getInvitationsByUser(userId);
            return ResponseEntity.ok(invitations);
        } catch (Exception e) {
            log.error("Failed to get invitations for user: {}", userId, e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/pending/{email}")
    public ResponseEntity<?> checkPendingInvitation(@PathVariable String email) {
        try {
            UserInvitation invitation = invitationService.getActivePendingInvitation(email);
            if (invitation != null) {
                return ResponseEntity.ok(Map.of(
                        "hasPendingInvitation", true,
                        "invitation", invitation));
            } else {
                return ResponseEntity.ok(Map.of(
                        "hasPendingInvitation", false));
            }
        } catch (Exception e) {
            log.error("Failed to check pending invitation", e);
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage()));
        }
    }

    @PostMapping("/activate")
    public ResponseEntity<?> activateInvitation(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String tenantId = request.get("tenantId");
            String processServerId = request.get("processServerId");

            UserInvitation invitation = invitationService.activateInvitation(email, tenantId, processServerId);

            if (invitation != null) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Invitation activated successfully",
                        "invitation", invitation));
            } else {
                return ResponseEntity.ok(Map.of(
                        "success", false,
                        "message", "No active invitation found"));
            }
        } catch (Exception e) {
            log.error("Failed to activate invitation", e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }

    @PostMapping("/cleanup-expired")
    public ResponseEntity<?> manualCleanup() {
        try {
            invitationService.cleanupExpiredInvitations();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Expired invitations cleaned up successfully"));
        } catch (Exception e) {
            log.error("Failed to cleanup expired invitations", e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }
}
