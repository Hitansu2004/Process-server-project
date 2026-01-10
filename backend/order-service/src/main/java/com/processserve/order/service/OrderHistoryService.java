package com.processserve.order.service;

import com.processserve.order.entity.Order;
import com.processserve.order.entity.OrderRecipient;
import com.processserve.order.entity.OrderHistory;
import com.processserve.order.repository.OrderHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderHistoryService {

    private final OrderHistoryRepository historyRepository;
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm");

    @Transactional
    public void trackOrderCreation(Order order, String userId, String role) {
        OrderHistory history = new OrderHistory();
        history.setId(UUID.randomUUID().toString());
        history.setOrderId(order.getId());
        history.setRecipientId(null);
        history.setChangedByUserId(userId);
        history.setChangedByRole(role);
        history.setChangeType("CREATED");
        history.setFieldName(null);
        history.setOldValue(null);
        history.setNewValue(null);
        history.setDescription(String.format("Order %s created with %d recipient(s)",
                order.getOrderNumber(), order.getRecipients().size()));
        history.setCreatedAt(LocalDateTime.now());

        historyRepository.save(history);
    }

    @Transactional
    public void trackRecipientEdit(OrderRecipient recipient, Map<String, String[]> changes, String userId,
            String role) {
        for (Map.Entry<String, String[]> entry : changes.entrySet()) {
            String fieldName = entry.getKey();
            String oldValue = entry.getValue()[0];
            String newValue = entry.getValue()[1];

            if (oldValue == null || !oldValue.equals(newValue)) {
                OrderHistory history = new OrderHistory();
                history.setId(UUID.randomUUID().toString());
                history.setOrderId(recipient.getOrder().getId());
                history.setRecipientId(recipient.getId());
                history.setChangedByUserId(userId);
                history.setChangedByRole(role);
                history.setChangeType("EDITED");
                history.setFieldName(fieldName);
                history.setOldValue(oldValue);
                history.setNewValue(newValue);
                history.setDescription(String.format("Updated %s from '%s' to '%s'",
                        formatFieldName(fieldName),
                        oldValue != null ? oldValue : "",
                        newValue));
                history.setCreatedAt(LocalDateTime.now());

                historyRepository.save(history);
            }
        }
    }

    @Transactional
    public void trackOrderEdit(Order order, Map<String, String[]> changes, String userId, String role) {
        for (Map.Entry<String, String[]> entry : changes.entrySet()) {
            String fieldName = entry.getKey();
            String oldValue = entry.getValue()[0];
            String newValue = entry.getValue()[1];

            if (oldValue == null || !oldValue.equals(newValue)) {
                OrderHistory history = new OrderHistory();
                history.setId(UUID.randomUUID().toString());
                history.setOrderId(order.getId());
                history.setRecipientId(null);
                history.setChangedByUserId(userId);
                history.setChangedByRole(role);
                history.setChangeType("EDITED");
                history.setFieldName(fieldName);
                history.setOldValue(oldValue);
                history.setNewValue(newValue);
                history.setDescription(String.format("Updated %s from '%s' to '%s'",
                        formatFieldName(fieldName),
                        oldValue != null ? oldValue : "",
                        newValue));
                history.setCreatedAt(LocalDateTime.now());

                historyRepository.save(history);
            }
        }
    }

    @Transactional
    public void trackStatusChange(OrderRecipient recipient, String oldStatus, String newStatus, String userId,
            String role) {
        OrderHistory history = new OrderHistory();
        history.setId(UUID.randomUUID().toString());
        history.setOrderId(recipient.getOrder().getId());
        history.setRecipientId(recipient.getId());
        history.setChangedByUserId(userId);
        history.setChangedByRole(role);
        history.setChangeType("STATUS_CHANGED");
        history.setFieldName("status");
        history.setOldValue(oldStatus);
        history.setNewValue(newStatus);
        history.setDescription(String.format("Recipient status changed from %s to %s", oldStatus, newStatus));
        history.setCreatedAt(LocalDateTime.now());

        historyRepository.save(history);
    }

    @Transactional
    public void trackDocumentUpload(String orderId, String recipientId, String filename, String userId, String role) {
        OrderHistory history = new OrderHistory();
        history.setId(UUID.randomUUID().toString());
        history.setOrderId(orderId);
        history.setRecipientId(recipientId);
        history.setChangedByUserId(userId);
        history.setChangedByRole(role);
        history.setChangeType("DOCUMENT_UPLOADED");
        history.setFieldName("document");
        history.setOldValue(null);
        history.setNewValue(filename);
        history.setDescription(String.format("Document '%s' uploaded", filename));
        history.setCreatedAt(LocalDateTime.now());

        historyRepository.save(history);
    }

    @Transactional
    public void trackDeliveryCompletion(OrderRecipient recipient, String userId, String role) {
        OrderHistory history = new OrderHistory();
        history.setId(UUID.randomUUID().toString());
        history.setOrderId(recipient.getOrder().getId());
        history.setRecipientId(recipient.getId());
        history.setChangedByUserId(userId);
        history.setChangedByRole(role);
        history.setChangeType("DELIVERY_COMPLETED");
        history.setFieldName(null);
        history.setOldValue(null);
        history.setNewValue(LocalDateTime.now().format(formatter));
        history.setDescription(String.format("Delivery completed to %s at %s",
                recipient.getRecipientName(),
                recipient.getRecipientAddress()));
        history.setCreatedAt(LocalDateTime.now());

        historyRepository.save(history);
    }

    public List<OrderHistory> getOrderHistory(String orderId) {
        return historyRepository.findByOrderIdOrderByCreatedAtDesc(orderId);
    }

    public List<OrderHistory> getRecipientHistory(String recipientId) {
        return historyRepository.findByRecipientIdOrderByCreatedAtDesc(recipientId);
    }

    private String formatFieldName(String fieldName) {
        return fieldName.replaceAll("([A-Z])", " $1")
                .toLowerCase()
                .trim();
    }
}
