package com.processserve.order.controller;

import com.processserve.order.dto.AddParticipantRequest;
import com.processserve.order.dto.ChatParticipantResponse;
import com.processserve.order.dto.MessageResponse;
import com.processserve.order.dto.SendMessageRequest;
import com.processserve.order.entity.Message;
import com.processserve.order.service.ChatParticipantService;
import com.processserve.order.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@Slf4j
public class MessageController {

    private final MessageService messageService;
    private final ChatParticipantService participantService;

    // Send message
    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(
            @RequestBody SendMessageRequest request,
            @RequestHeader("userId") String userId,
            @RequestHeader("userRole") String userRole) {

        log.info("POST /api/messages - Sending message from user: {}", userId);
        Message.UserRole role = Message.UserRole.valueOf(userRole.toUpperCase());
        MessageResponse response = messageService.sendMessage(request, userId, role);
        return ResponseEntity.ok(response);
    }

    // Get messages for an order
    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<MessageResponse>> getOrderMessages(@PathVariable String orderId) {
        log.info("GET /api/messages/order/{} - Fetching messages", orderId);
        List<MessageResponse> messages = messageService.getOrderMessages(orderId);
        return ResponseEntity.ok(messages);
    }

    // Mark message as read
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable String id) {
        log.info("PUT /api/messages/{}/read - Marking as read", id);
        messageService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    // Mark all messages in order as read
    @PutMapping("/order/{orderId}/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @PathVariable String orderId,
            @RequestHeader("userId") String userId) {

        log.info("PUT /api/messages/order/{}/read-all - Marking all as read", orderId);
        messageService.markAllOrderMessagesAsRead(orderId, userId);
        return ResponseEntity.ok().build();
    }

    // Get unread count
    @GetMapping("/order/{orderId}/unread-count")
    public ResponseEntity<Long> getUnreadCount(
            @PathVariable String orderId,
            @RequestHeader("userId") String userId) {

        log.info("GET /api/messages/order/{}/unread-count", orderId);
        long count = messageService.getUnreadCount(orderId, userId);
        return ResponseEntity.ok(count);
    }

    // Delete message
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable String id) {
        log.info("DELETE /api/messages/{}", id);
        messageService.deleteMessage(id);
        return ResponseEntity.ok().build();
    }

    // Add participant to chat
    @PostMapping("/participants")
    public ResponseEntity<ChatParticipantResponse> addParticipant(
            @RequestBody AddParticipantRequest request,
            @RequestHeader("userId") String addedByUserId) {

        log.info("POST /api/messages/participants - Adding participant");
        ChatParticipantResponse response = participantService.addParticipant(request, addedByUserId);
        return ResponseEntity.ok(response);
    }

    // Remove participant
    @DeleteMapping("/participants/{id}")
    public ResponseEntity<Void> removeParticipant(@PathVariable String id) {
        log.info("DELETE /api/messages/participants/{}", id);
        participantService.removeParticipant(id);
        return ResponseEntity.ok().build();
    }

    // Get active participants
    @GetMapping("/participants/order/{orderId}")
    public ResponseEntity<List<ChatParticipantResponse>> getActiveParticipants(@PathVariable String orderId) {
        log.info("GET /api/messages/participants/order/{}", orderId);
        List<ChatParticipantResponse> participants = participantService.getActiveParticipants(orderId);
        return ResponseEntity.ok(participants);
    }

    // Health check
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Message service is UP");
    }
}
