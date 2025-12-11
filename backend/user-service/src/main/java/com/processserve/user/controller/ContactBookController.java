package com.processserve.user.controller;

import com.processserve.user.entity.ContactBookEntry;
import com.processserve.user.service.ContactBookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contact-book")
@RequiredArgsConstructor
@Slf4j
public class ContactBookController {

    private final ContactBookService contactBookService;

    @GetMapping("/{ownerUserId}")
    public ResponseEntity<List<ContactBookEntry>> getContactList(@PathVariable String ownerUserId) {
        return ResponseEntity.ok(contactBookService.getContactList(ownerUserId));
    }

    @PostMapping
    public ResponseEntity<?> addEntry(@RequestBody Map<String, String> request) {
        try {
            String ownerUserId = request.get("ownerUserId");
            String processServerId = request.get("processServerId");
            String nickname = request.get("nickname");
            String typeStr = request.get("type");
            ContactBookEntry.EntryType type = typeStr != null ? ContactBookEntry.EntryType.valueOf(typeStr)
                    : ContactBookEntry.EntryType.MANUAL;

            ContactBookEntry entry = contactBookService.addEntry(ownerUserId, processServerId, type, nickname);
            return ResponseEntity.ok(entry);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{entryId}")
    public ResponseEntity<?> removeEntry(@PathVariable String entryId) {
        try {
            contactBookService.removeEntry(entryId);
            return ResponseEntity.ok(Map.of("message", "Entry removed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/auto-add")
    public ResponseEntity<?> autoAddProcessServer(
            @RequestParam String customerId,
            @RequestParam String processServerId) {
        try {
            contactBookService.autoAddProcessServer(customerId, processServerId);
            return ResponseEntity.ok(Map.of("message", "Auto-added successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<ContactBookEntry>> searchContacts(
            @RequestParam(required = false) String ownerUserId,
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(contactBookService.searchContacts(ownerUserId, type));
    }
}
