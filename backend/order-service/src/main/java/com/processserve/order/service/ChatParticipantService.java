package com.processserve.order.service;

import com.processserve.order.dto.AddParticipantRequest;
import com.processserve.order.dto.ChatParticipantResponse;
import com.processserve.order.entity.ChatParticipant;
import com.processserve.order.repository.ChatParticipantRepository;
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
public class ChatParticipantService {

    private final ChatParticipantRepository participantRepository;

    // Add participant to chat
    @Transactional
    public ChatParticipantResponse addParticipant(AddParticipantRequest request, String addedByUserId) {
        log.info("Adding participant {} to order {}", request.getUserId(), request.getOrderId());

        ChatParticipant.UserRole role = ChatParticipant.UserRole.valueOf(request.getUserRole());

        // Check if already exists
        var existing = participantRepository.findByOrderUserAndRole(request.getOrderId(), request.getUserId(), role);
        if (existing.isPresent()) {
            ChatParticipant participant = existing.get();
            if (!participant.getIsActive()) {
                // Reactivate
                participant.setIsActive(true);
                participant.setRemovedAt(null);
                participant.setAddedAt(LocalDateTime.now());
                participant.setAddedByUserId(addedByUserId);
                ChatParticipant saved = participantRepository.save(participant);
                return convertToResponse(saved);
            }
            return convertToResponse(participant);
        }

        // Create new
        ChatParticipant participant = new ChatParticipant();
        participant.setId(UUID.randomUUID().toString());
        participant.setOrderId(request.getOrderId());
        participant.setUserId(request.getUserId());
        participant.setUserRole(role);
        participant.setIsActive(true);
        participant.setAddedByUserId(addedByUserId);
        participant.setAddedAt(LocalDateTime.now());

        ChatParticipant saved = participantRepository.save(participant);
        log.info("Participant added: {}", saved.getId());

        return convertToResponse(saved);
    }

    // Remove participant from chat
    @Transactional
    public void removeParticipant(String participantId) {
        log.info("Removing participant: {}", participantId);
        ChatParticipant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found: " + participantId));

        participant.setIsActive(false);
        participant.setRemovedAt(LocalDateTime.now());
        participantRepository.save(participant);
        log.info("Participant removed: {}", participantId);
    }

    // Get active participants for an order
    @Transactional(readOnly = true)
    public List<ChatParticipantResponse> getActiveParticipants(String orderId) {
        log.info("Fetching active participants for order: {}", orderId);
        return participantRepository.findActiveParticipantsByOrder(orderId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Check if user is active participant
    @Transactional(readOnly = true)
    public boolean isActiveParticipant(String orderId, String userId) {
        return participantRepository.findActiveParticipantByOrderAndUser(orderId, userId).isPresent();
    }

    // Helper: Convert to response
    private ChatParticipantResponse convertToResponse(ChatParticipant participant) {
        ChatParticipantResponse response = new ChatParticipantResponse();
        response.setId(participant.getId());
        response.setOrderId(participant.getOrderId());
        response.setUserId(participant.getUserId());
        response.setUserRole(participant.getUserRole().name());
        response.setIsActive(participant.getIsActive());
        response.setAddedByUserId(participant.getAddedByUserId());
        response.setAddedAt(participant.getAddedAt());
        response.setRemovedAt(participant.getRemovedAt());
        return response;
    }
}
