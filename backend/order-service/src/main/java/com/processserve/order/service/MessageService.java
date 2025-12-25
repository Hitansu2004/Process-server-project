package com.processserve.order.service;

import com.processserve.order.dto.MessageResponse;
import com.processserve.order.dto.SendMessageRequest;
import com.processserve.order.entity.ChatParticipant;
import com.processserve.order.entity.Message;
import com.processserve.order.repository.ChatParticipantRepository;
import com.processserve.order.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageService {

    private final MessageRepository messageRepository;
    private final ChatParticipantRepository participantRepository;

    // Send a message
    @Transactional
    public MessageResponse sendMessage(SendMessageRequest request, String senderId, Message.UserRole senderRole) {
        log.info("Sending message for order: {} from sender: {}", request.getOrderId(), senderId);

        // Ensure sender is a participant (if not, add them)
        ensureParticipant(request.getOrderId(), senderId, senderRole);

        // Create message
        Message message = new Message();
        message.setId(UUID.randomUUID().toString());
        message.setOrderId(request.getOrderId());
        message.setSenderId(senderId);
        message.setSenderRole(senderRole);
        message.setMessageText(request.getMessageText());
        message.setIsRead(false);
        message.setCreatedAt(LocalDateTime.now());

        Message saved = messageRepository.save(message);
        log.info("Message sent: {}", saved.getId());

        return convertToMessageResponse(saved);
    }

    // Get all messages for an order
    @Transactional(readOnly = true)
    public List<MessageResponse> getOrderMessages(String orderId) {
        log.info("Fetching messages for order: {}", orderId);
        return messageRepository.findByOrderIdOrderByCreatedAtAsc(orderId).stream()
                .map(this::convertToMessageResponse)
                .collect(Collectors.toList());
    }

    // Mark message as read
    @Transactional
    public void markAsRead(String messageId) {
        log.info("Marking message as read: {}", messageId);
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found: " + messageId));
        message.setIsRead(true);
        message.setUpdatedAt(LocalDateTime.now());
        messageRepository.save(message);
    }

    // Mark all messages in an order as read for a user
    @Transactional
    public void markAllOrderMessagesAsRead(String orderId, String userId) {
        log.info("Marking all messages as read for order: {} and user: {}", orderId, userId);
        List<Message> unread = messageRepository.findUnreadMessagesByOrder(orderId);
        for (Message message : unread) {
            if (!message.getSenderId().equals(userId)) {
                message.setIsRead(true);
                message.setUpdatedAt(LocalDateTime.now());
            }
        }
        messageRepository.saveAll(unread);
    }

    // Get unread count
    @Transactional(readOnly = true)
    public long getUnreadCount(String orderId, String userId) {
        return messageRepository.countUnreadMessagesByOrderAndUser(orderId, userId);
    }

    // Delete message
    @Transactional
    public void deleteMessage(String messageId) {
        log.info("Deleting message: {}", messageId);
        messageRepository.deleteById(messageId);
    }

    // Helper: Ensure user is a participant
    private void ensureParticipant(String orderId, String userId, Message.UserRole userRole) {
        ChatParticipant.UserRole participantRole = ChatParticipant.UserRole.valueOf(userRole.name());
        var existing = participantRepository.findByOrderUserAndRole(orderId, userId, participantRole);

        if (existing.isEmpty()) {
            ChatParticipant participant = new ChatParticipant();
            participant.setId(UUID.randomUUID().toString());
            participant.setOrderId(orderId);
            participant.setUserId(userId);
            participant.setUserRole(participantRole);
            participant.setIsActive(true);
            participant.setAddedAt(LocalDateTime.now());
            participantRepository.save(participant);
            log.info("Added participant: {} to order: {}", userId, orderId);
        }
    }

    // Helper: Convert Message to MessageResponse
    private MessageResponse convertToMessageResponse(Message message) {
        MessageResponse response = new MessageResponse();
        response.setId(message.getId());
        response.setOrderId(message.getOrderId());
        response.setSenderId(message.getSenderId());
        response.setSenderRole(message.getSenderRole().name());
        response.setMessageText(message.getMessageText());
        response.setIsRead(message.getIsRead());
        response.setCreatedAt(message.getCreatedAt());
        response.setUpdatedAt(message.getUpdatedAt());
        return response;
    }
}
