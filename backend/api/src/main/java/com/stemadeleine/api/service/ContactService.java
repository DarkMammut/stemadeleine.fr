package com.stemadeleine.api.service;

import com.stemadeleine.api.model.Contact;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.ContactRepository;
import com.stemadeleine.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactRepository contactRepository;
    private final UserRepository userRepository;

    /**
     * Creates a new contact and attempts to link it to an existing user based on email
     */
    @Transactional
    public Contact createContact(Contact contact) {
        log.info("Creating new contact for email: {}", contact.getEmail());

        // Attempt to link with existing user based on email
        if (contact.getEmail() != null && !contact.getEmail().trim().isEmpty()) {
            Optional<User> existingUser = userRepository.findByEmailIgnoreCase(contact.getEmail().trim());
            if (existingUser.isPresent()) {
                contact.setUser(existingUser.get());
                log.info("Contact linked to existing user: {} {}",
                        existingUser.get().getFirstname(), existingUser.get().getLastname());
            } else {
                log.info("No user found for email: {}", contact.getEmail());
            }
        }

        Contact savedContact = contactRepository.save(contact);
        log.info("Contact created with ID: {}", savedContact.getId());
        return savedContact;
    }

    /**
     * Finds all contacts sorted by creation date descending
     */
    public List<Contact> findAllOrderByCreatedAtDesc() {
        return contactRepository.findAllOrderByCreatedAtDesc();
    }

    /**
     * Finds paginated contacts sorted by creation date descending
     */
    public Page<Contact> findAllOrderByCreatedAtDesc(Pageable pageable) {
        return contactRepository.findAllOrderByCreatedAtDesc(pageable);
    }

    /**
     * Finds a contact by its ID
     */
    public Optional<Contact> findById(UUID id) {
        return contactRepository.findById(id);
    }

    /**
     * Finds all contacts by email
     */
    public List<Contact> findByEmail(String email) {
        return contactRepository.findByEmailIgnoreCase(email);
    }

    /**
     * Finds paginated contacts by email
     */
    public Page<Contact> findByEmail(String email, Pageable pageable) {
        return contactRepository.findByEmailIgnoreCase(email, pageable);
    }

    /**
     * Finds all contacts for a specific user
     */
    public List<Contact> findByUser(User user) {
        return contactRepository.findByUser(user);
    }

    /**
     * Finds all contacts not linked to any user
     */
    public List<Contact> findUnlinkedContacts() {
        return contactRepository.findByUserIsNull();
    }

    /**
     * Finds paginated unlinked contacts
     */
    public Page<Contact> findUnlinkedContacts(Pageable pageable) {
        return contactRepository.findByUserIsNull(pageable);
    }

    /**
     * Finds all contacts within a given date range
     */
    public List<Contact> findByDateRange(OffsetDateTime startDate, OffsetDateTime endDate) {
        return contactRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(startDate, endDate);
    }

    /**
     * Finds paginated contacts within a given date range
     */
    public Page<Contact> findByDateRange(OffsetDateTime startDate, OffsetDateTime endDate, Pageable pageable) {
        return contactRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(startDate, endDate, pageable);
    }

    /**
     * Deletes a contact
     */
    @Transactional
    public void deleteContact(UUID id) {
        log.info("Deleting contact with ID: {}", id);
        contactRepository.deleteById(id);
    }

    /**
     * Updates the link between a contact and a user
     */
    @Transactional
    public Optional<Contact> linkContactToUser(UUID contactId, UUID userId) {
        log.info("Attempting to link contact {} with user {}", contactId, userId);

        Optional<Contact> contactOpt = contactRepository.findById(contactId);
        Optional<User> userOpt = userRepository.findById(userId);

        if (contactOpt.isPresent() && userOpt.isPresent()) {
            Contact contact = contactOpt.get();
            User user = userOpt.get();

            contact.setUser(user);
            Contact updatedContact = contactRepository.save(contact);

            log.info("Contact {} successfully linked to user {}", contactId, userId);
            return Optional.of(updatedContact);
        }

        log.warn("Unable to link contact {} to user {}", contactId, userId);
        return Optional.empty();
    }

    /**
     * Removes the link between a contact and a user
     */
    @Transactional
    public Optional<Contact> unlinkContactFromUser(UUID contactId) {
        log.info("Removing link for contact {}", contactId);

        Optional<Contact> contactOpt = contactRepository.findById(contactId);

        if (contactOpt.isPresent()) {
            Contact contact = contactOpt.get();
            contact.setUser(null);
            Contact updatedContact = contactRepository.save(contact);

            log.info("Link removed for contact {}", contactId);
            return Optional.of(updatedContact);
        }

        log.warn("Contact {} not found", contactId);
        return Optional.empty();
    }

    /**
     * Marks a contact as read
     */
    @Transactional
    public Optional<Contact> markAsRead(UUID contactId, Boolean isRead) {
        log.info("Marking contact {} as {}", contactId, isRead ? "read" : "unread");

        Optional<Contact> contactOpt = contactRepository.findById(contactId);

        if (contactOpt.isPresent()) {
            Contact contact = contactOpt.get();
            contact.setIsRead(isRead);
            Contact updatedContact = contactRepository.save(contact);

            log.info("Contact {} marked as {}", contactId, isRead ? "read" : "unread");
            return Optional.of(updatedContact);
        }

        log.warn("Contact {} not found", contactId);
        return Optional.empty();
    }

    /**
     * Search and filter (isRead) with pagination
     */
    public Page<Contact> searchAndFilter(String search, Boolean isRead, Pageable pageable) {
        try {
            // If search is empty and we only filter by isRead, use the simpler repository method
            if ((search == null || search.isBlank()) && isRead != null) {
                return contactRepository.findByIsReadExplicit(isRead, pageable);
            }
            // otherwise use the combined search and filter query
            return contactRepository.searchAndFilter(search, isRead, pageable);
        } catch (Exception ex) {
            log.error("Error in ContactService.searchAndFilter (search='{}' isRead={})", search, isRead, ex);
            throw new RuntimeException("Failed to execute contact search/filter", ex);
        }
    }

    // explicit alias to ensure controller can call a stable method name
    public Page<Contact> searchAndFilterContacts(String search, Boolean isRead, Pageable pageable) {
        return searchAndFilter(search, isRead, pageable);
    }
}
