package com.processserve.auth.controller;

import com.processserve.auth.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/invites")
@RequiredArgsConstructor
@Slf4j
public class InviteController {

    private final EmailService emailService;
    private final RestTemplate restTemplate;

    @PostMapping("/process-server")
    public ResponseEntity<?> inviteProcessServer(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String inviterName = request.get("inviterName");
            String invitedByUserId = request.get("invitedByUserId");
            String tenantId = request.get("tenantId");

            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Email is required");
            }

            if (inviterName == null || inviterName.trim().isEmpty()) {
                inviterName = "A customer";
            }

            // Default tenant if not provided
            if (tenantId == null || tenantId.trim().isEmpty()) {
                tenantId = "tenant-1"; // Default tenant
            }

            log.info("Sending process server invitation to: {} from: {}", email, inviterName);
            
            // Create invitation record in user-service if invitedByUserId is provided
            if (invitedByUserId != null && !invitedByUserId.trim().isEmpty()) {
                try {
                    Map<String, Object> invitationRequest = new HashMap<>();
                    invitationRequest.put("invitedByUserId", invitedByUserId);
                    invitationRequest.put("invitedEmail", email);
                    invitationRequest.put("firstName", email.split("@")[0]); // Use email prefix as first name
                    invitationRequest.put("lastName", "");
                    invitationRequest.put("tenantId", tenantId);
                    invitationRequest.put("role", "PROCESS_SERVER");

                    restTemplate.postForObject("http://USER-SERVICE/api/invitations", invitationRequest, Map.class);
                    log.info("Invitation record created in user-service");
                } catch (Exception e) {
                    log.error("Failed to create invitation record in user-service", e);
                    // Continue with email sending even if invitation record creation fails
                }
            }
            
            // Send invitation email
            emailService.sendProcessServerInvitation(email, inviterName);

            return ResponseEntity.ok(Map.of(
                "message", "Invitation sent successfully",
                "email", email
            ));
        } catch (Exception e) {
            log.error("Failed to send invitation", e);
            return ResponseEntity.internalServerError()
                .body("Failed to send invitation: " + e.getMessage());
        }
    }
}
