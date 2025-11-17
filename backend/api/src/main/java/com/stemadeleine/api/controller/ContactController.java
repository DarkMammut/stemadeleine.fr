package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.ContactDto;
import com.stemadeleine.api.model.Contact;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.service.ContactService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

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
    public ResponseEntity<Page<ContactDto>> getAllContacts(Pageable pageable,
                                                           @RequestParam(value = "search", required = false) String search,
                                                           @RequestParam(value = "sortField", required = false) String sortField,
                                                           @RequestParam(value = "sortDir", required = false) String sortDir,
                                                           @RequestParam(value = "filter", required = false) String filter) {

        log.info("GET /api/contacts - Retrieving contacts (paginated) with search/sort/filter");
        Page<ContactDto> dtoPage = fetchContactsPage(pageable, search, sortField, sortDir, filter);
        return ResponseEntity.ok(dtoPage);
    }

    // Backwards-compatible overload for direct Java calls (tests / internal callers)
    public ResponseEntity<Page<ContactDto>> getAllContacts(Pageable pageable) {
        Page<ContactDto> dtoPage = fetchContactsPage(pageable, null, null, null, null);
        return ResponseEntity.ok(dtoPage);
    }

    // Shared logic extracted to avoid proxy/self-invocation issues with @PreAuthorize
    private Page<ContactDto> fetchContactsPage(Pageable pageable, String search, String sortField, String sortDir, String filter) {
        org.springframework.data.domain.Pageable appliedPageable = pageable;
        // default sort: createdAt desc if not provided
        if (sortField == null || sortField.isBlank()) {
            appliedPageable = org.springframework.data.domain.PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        }
        if (sortField != null && !sortField.isBlank()) {
            java.util.Set<String> allowed = java.util.Set.of("firstName", "lastName", "email", "createdAt");
            if (allowed.contains(sortField)) {
                org.springframework.data.domain.Sort.Direction dir = org.springframework.data.domain.Sort.Direction.ASC;
                if ("desc".equalsIgnoreCase(sortDir)) dir = org.springframework.data.domain.Sort.Direction.DESC;
                appliedPageable = org.springframework.data.domain.PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), org.springframework.data.domain.Sort.by(dir, sortField));
            } else {
                log.warn("Ignoring invalid sortField: {}", sortField);
            }
        }

        Page<Contact> page;
        Boolean isRead = null;
        if (filter != null) {
            if ("unread".equalsIgnoreCase(filter)) isRead = false;
            else if ("read".equalsIgnoreCase(filter)) isRead = true;
        }

        if ((search != null && !search.isBlank()) || isRead != null) {
            String s = (search == null || search.isBlank()) ? null : search.toLowerCase();
            page = contactService.searchAndFilterContacts(s, isRead, appliedPageable);
        } else {
            page = contactService.findAllOrderByCreatedAtDesc(appliedPageable);
        }

        return page.map(this::convertToDto);
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
    public ResponseEntity<Page<ContactDto>> getContactsByEmail(@RequestParam String email, Pageable pageable) {
        log.info("GET /api/contacts/search/email?email={} - Searching by email", email);

        Page<Contact> contacts = contactService.findByEmail(email, pageable);
        Page<ContactDto> contactDtos = contacts.map(this::convertToDto);

        log.debug("Found {} contacts for email {}", contactDtos.getTotalElements(), email);
        return ResponseEntity.ok(contactDtos);
    }

    /**
     * Retrieves contacts not linked to any user
     */
    @GetMapping("/unlinked")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<Page<ContactDto>> getUnlinkedContacts(Pageable pageable) {
        log.info("GET /api/contacts/unlinked - Retrieving unlinked contacts");

        Page<Contact> contacts = contactService.findUnlinkedContacts(pageable);
        Page<ContactDto> contactDtos = contacts.map(this::convertToDto);

        log.debug("Found {} unlinked contacts", contactDtos.getTotalElements());
        return ResponseEntity.ok(contactDtos);
    }

    /**
     * Retrieves contacts within a given date range
     */
    @GetMapping("/date-range")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<Page<ContactDto>> getContactsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endDate,
            Pageable pageable) {
        log.info("GET /api/contacts/date-range - Retrieving contacts between {} and {}", startDate, endDate);

        Page<Contact> contacts = contactService.findByDateRange(startDate, endDate, pageable);
        Page<ContactDto> contactDtos = contacts.map(this::convertToDto);

        log.debug("Found {} contacts in date range", contactDtos.getTotalElements());
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
