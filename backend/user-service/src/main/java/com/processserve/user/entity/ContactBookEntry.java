package com.processserve.user.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "contact_book_entries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactBookEntry {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "owner_user_id", length = 36, nullable = false)
    private String ownerUserId; // Customer or Admin ID

    @Column(name = "process_server_id", length = 36, nullable = false)
    private String processServerId;

    @Column(name = "entry_type", length = 20, nullable = false)
    @Enumerated(EnumType.STRING)
    private EntryType entryType;

    @Column(name = "activation_status", length = 20, nullable = false)
    @Enumerated(EnumType.STRING)
    private ActivationStatus activationStatus = ActivationStatus.ACTIVATED;

    @Column(name = "invitation_id", length = 36)
    private String invitationId;

    @Column(name = "nickname")
    private String nickname;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum EntryType {
        MANUAL, AUTO_ADDED
    }

    public enum ActivationStatus {
        ACTIVATED, NOT_ACTIVATED
    }
}
