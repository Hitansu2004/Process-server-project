package com.processserve.auth.controller;

import com.processserve.auth.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/invites")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class InviteController {

    private final EmailService emailService;

    @PostMapping("/process-server")
    public ResponseEntity<?> inviteProcessServer(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String inviterName = request.get("inviterName");

            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Email is required");
            }

            if (inviterName == null || inviterName.trim().isEmpty()) {
                inviterName = "A customer";
            }

            log.info("Sending process server invitation to: {} from: {}", email, inviterName);
            
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
