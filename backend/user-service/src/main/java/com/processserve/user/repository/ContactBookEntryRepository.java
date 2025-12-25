package com.processserve.user.repository;

import com.processserve.user.entity.ContactBookEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContactBookEntryRepository extends JpaRepository<ContactBookEntry, String> {
    List<ContactBookEntry> findByOwnerUserId(String ownerUserId);

    List<ContactBookEntry> findByEntryType(ContactBookEntry.EntryType entryType);

    List<ContactBookEntry> findByOwnerUserIdAndEntryType(String ownerUserId, ContactBookEntry.EntryType entryType);

    Optional<ContactBookEntry> findByOwnerUserIdAndProcessServerId(String ownerUserId, String processServerId);

    List<ContactBookEntry> findByInvitationId(String invitationId);
}
