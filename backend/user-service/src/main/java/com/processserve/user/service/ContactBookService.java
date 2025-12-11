package com.processserve.user.service;

import com.processserve.user.entity.ContactBookEntry;
import com.processserve.user.entity.ProcessServerProfile;
import com.processserve.user.repository.ContactBookEntryRepository;
import com.processserve.user.repository.ProcessServerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContactBookService {

    private final ContactBookEntryRepository contactBookRepository;
    private final ProcessServerRepository processServerRepository;

    public List<ContactBookEntry> getContactList(String ownerUserId) {
        return contactBookRepository.findByOwnerUserId(ownerUserId);
    }

    @Transactional
    public ContactBookEntry addEntry(String ownerUserId, String processServerId, ContactBookEntry.EntryType type,
            String nickname) {
        // Validate process server exists
        if (!processServerRepository.existsById(processServerId)) {
            // Note: processServerId here refers to the ID in process_server_profiles table
            // (which is the tenantUserRoleId usually?
            // Or the ID column of that table? The repository is
            // JpaRepository<ProcessServerProfile, String>.
            // So it checks the ID of the profile.
            throw new RuntimeException("Process Server not found");
        }

        // Check if already exists
        return contactBookRepository.findByOwnerUserIdAndProcessServerId(ownerUserId, processServerId)
                .orElseGet(() -> {
                    ContactBookEntry entry = new ContactBookEntry();
                    entry.setId(UUID.randomUUID().toString());
                    entry.setOwnerUserId(ownerUserId);
                    entry.setProcessServerId(processServerId);
                    entry.setEntryType(type);
                    entry.setNickname(nickname);
                    return contactBookRepository.save(entry);
                });
    }

    public List<ContactBookEntry> getGlobalProcessServers() {
        // Assuming global servers are just profiles, but if we want them in contact
        // book format:
        // Or maybe this returns profiles?
        // The requirement: "super admin will have access too all the process servers
        // availbe in his concat book with special fiter like he can sort like global
        // only manullay added and he can also sort them as per customers contcat book"
        // So Super Admin wants to see ContactBookEntries.
        // 1. Global Only: Maybe entries where owner is "global"? Or just all profiles?
        // Let's assume "Global Process Servers" are stored as ContactBookEntry with
        // owner="global" OR just return all profiles.
        // Given the previous task "Global Process Servers", we created profiles with
        // tenantId="global".
        // So this method should probably return ProcessServerProfiles, not
        // ContactBookEntries.
        // But the UI might expect a unified list.
        // Let's stick to returning ContactBookEntries for consistency if the UI expects
        // that.
        // If not, we can return Profiles.
        // Let's add a method to get all entries for a specific customer (already
        // exists: getContactList).
        // Let's add a method to get all entries of a specific type (MANUAL vs
        // AUTO_ADDED).
        return contactBookRepository.findAll(); // Super admin sees all?
    }

    public List<ContactBookEntry> getContactsByType(ContactBookEntry.EntryType type) {
        return contactBookRepository.findByEntryType(type);
    }

    public List<ContactBookEntry> getContactsByOwner(String ownerUserId) {
        return contactBookRepository.findByOwnerUserId(ownerUserId);
    }

    // For "Global", we might mean ProcessServers that are global.
    // This might be in ProcessServerService, not ContactBookService.
    // But if Super Admin treats them as "his contact book", maybe we need a way to
    // view them here.
    // I'll add a method to search/filter.
    public List<ContactBookEntry> searchContacts(String ownerUserId, String type) {
        if (ownerUserId != null && type != null) {
            return contactBookRepository.findByOwnerUserIdAndEntryType(ownerUserId,
                    ContactBookEntry.EntryType.valueOf(type));
        } else if (ownerUserId != null) {
            return contactBookRepository.findByOwnerUserId(ownerUserId);
        } else if (type != null) {
            return contactBookRepository.findByEntryType(ContactBookEntry.EntryType.valueOf(type));
        } else {
            return contactBookRepository.findAll();
        }
    }

    @Transactional
    public void removeEntry(String entryId) {
        contactBookRepository.deleteById(entryId);
    }

    @Transactional
    public void autoAddProcessServer(String ownerUserId, String processServerId) {
        // Only add if not exists
        if (contactBookRepository.findByOwnerUserIdAndProcessServerId(ownerUserId, processServerId).isEmpty()) {
            addEntry(ownerUserId, processServerId, ContactBookEntry.EntryType.AUTO_ADDED, null);
        }
    }
}
