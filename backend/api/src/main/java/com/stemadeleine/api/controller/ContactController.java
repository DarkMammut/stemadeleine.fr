package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.ContactDto;
import com.stemadeleine.api.model.Contact;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.service.ContactService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/contacts")
@CrossOrigin(origins = {"http://localhost:3000", "https://stemadeleine.fr"})
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    /**
     * Retrieves all contacts sorted by creation date descending
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<List<ContactDto>> getAllContacts() {
        log.info("GET /api/contacts - Retrieving all contacts");

        List<Contact> contacts = contactService.findAllOrderByCreatedAtDesc();
        List<ContactDto> contactDtos = contacts.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        log.debug("Found {} contacts", contactDtos.size());
        return ResponseEntity.ok(contactDtos);
    }

    /**
     * Retrieves a contact by its ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<ContactDto> getContactById(@PathVariable UUID id) {
        log.info("GET /api/contacts/{} - Retrieving contact", id);

        Optional<Contact> contactOpt = contactService.findById(id);
        if (contactOpt.isPresent()) {
            ContactDto contactDto = convertToDto(contactOpt.get());
            return ResponseEntity.ok(contactDto);
        }

        log.warn("Contact {} not found", id);
        return ResponseEntity.notFound().build();
    }

    /**
     * Searches contacts by email
     */
    @GetMapping("/search/email")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<List<ContactDto>> getContactsByEmail(@RequestParam String email) {
        log.info("GET /api/contacts/search/email?email={} - Searching by email", email);

        List<Contact> contacts = contactService.findByEmail(email);
        List<ContactDto> contactDtos = contacts.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        log.debug("Found {} contacts for email {}", contactDtos.size(), email);
        return ResponseEntity.ok(contactDtos);
    }

    /**
     * Retrieves contacts not linked to any user
     */
    @GetMapping("/unlinked")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<List<ContactDto>> getUnlinkedContacts() {
        log.info("GET /api/contacts/unlinked - Retrieving unlinked contacts");

        List<Contact> contacts = contactService.findUnlinkedContacts();
        List<ContactDto> contactDtos = contacts.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        log.debug("Found {} unlinked contacts", contactDtos.size());
        return ResponseEntity.ok(contactDtos);
    }

    /**
     * Retrieves contacts within a given date range
     */
    @GetMapping("/date-range")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<List<ContactDto>> getContactsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endDate) {
        log.info("GET /api/contacts/date-range - Retrieving contacts between {} and {}", startDate, endDate);

        List<Contact> contacts = contactService.findByDateRange(startDate, endDate);
        List<ContactDto> contactDtos = contacts.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        log.debug("Found {} contacts in date range", contactDtos.size());
        return ResponseEntity.ok(contactDtos);
    }

    /**
     * Links a contact to a user
     */
    @PutMapping("/{contactId}/link/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ContactDto> linkContactToUser(@PathVariable UUID contactId, @PathVariable UUID userId) {
        log.info("PUT /api/contacts/{}/link/{} - Linking contact to user", contactId, userId);

        Optional<Contact> contactOpt = contactService.linkContactToUser(contactId, userId);
        if (contactOpt.isPresent()) {
            ContactDto contactDto = convertToDto(contactOpt.get());
            return ResponseEntity.ok(contactDto);
        }

        return ResponseEntity.notFound().build();
    }

    /**
     * Removes the link between a contact and a user
     */
    @PutMapping("/{contactId}/unlink")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ContactDto> unlinkContactFromUser(@PathVariable UUID contactId) {
        log.info("PUT /api/contacts/{}/unlink - Unlinking contact from user", contactId);

        Optional<Contact> contactOpt = contactService.unlinkContactFromUser(contactId);
        if (contactOpt.isPresent()) {
            ContactDto contactDto = convertToDto(contactOpt.get());
            return ResponseEntity.ok(contactDto);
        }

        return ResponseEntity.notFound().build();
    }

    /**
     * Marks a contact as read or unread
     */
    @PutMapping("/{contactId}/read")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<ContactDto> markContactAsRead(
            @PathVariable UUID contactId,
            @RequestParam Boolean isRead) {
        log.info("PUT /api/contacts/{}/read?isRead={} - Marking contact as read/unread", contactId, isRead);

        Optional<Contact> contactOpt = contactService.markAsRead(contactId, isRead);
        if (contactOpt.isPresent()) {
            ContactDto contactDto = convertToDto(contactOpt.get());
            return ResponseEntity.ok(contactDto);
        }

        return ResponseEntity.notFound().build();
    }

    /**
     * Deletes a contact
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteContact(@PathVariable UUID id) {
        log.info("DELETE /api/contacts/{} - Deleting contact", id);

        try {
            contactService.deleteContact(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting contact {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Converts a Contact entity to DTO
     */
    private ContactDto convertToDto(Contact contact) {
        ContactDto.ContactDtoBuilder builder = ContactDto.builder()
                .id(contact.getId())
                .firstName(contact.getFirstName())
                .lastName(contact.getLastName())
                .email(contact.getEmail())
                .subject(contact.getSubject())
                .message(contact.getMessage())
                .createdAt(contact.getCreatedAt())
                .isRead(contact.getIsRead() != null ? contact.getIsRead() : false);

        // Ajouter les informations utilisateur si présent
        if (contact.getUser() != null) {
            User user = contact.getUser();
            ContactDto.UserContactInfo userInfo = ContactDto.UserContactInfo.builder()
                    .id(user.getId())
                    .firstname(user.getFirstname())
                    .lastname(user.getLastname())
                    .email(user.getEmail())
                    .build();
            builder.user(userInfo);
        }

        return builder.build();
    }
}
