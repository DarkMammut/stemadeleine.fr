package com.stemadeleine.api.service;

import com.stemadeleine.api.model.Contact;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.ContactRepository;
import com.stemadeleine.api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Contact Service Tests")
class ContactServiceTest {

    @Mock
    private ContactRepository contactRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ContactService contactService;

    private Contact testContact;
    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(UUID.randomUUID())
                .firstname("John")
                .lastname("Doe")
                .email("john.doe@example.com")
                .build();

        testContact = Contact.builder()
                .id(UUID.randomUUID())
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .subject("Test Subject")
                .message("Test message content")
                .build();
    }

    @Test
    @DisplayName("Should create contact and link to existing user by email")
    void should_CreateContact_And_LinkToExistingUser_ByEmail() {
        // Given
        when(userRepository.findByEmailIgnoreCase("john.doe@example.com"))
                .thenReturn(Optional.of(testUser));
        when(contactRepository.save(any(Contact.class))).thenReturn(testContact);

        // When
        Contact result = contactService.createContact(testContact);

        // Then
        assertNotNull(result);
        assertEquals(testUser, testContact.getUser());
        verify(userRepository).findByEmailIgnoreCase("john.doe@example.com");
        verify(contactRepository).save(testContact);
    }

    @Test
    @DisplayName("Should create contact without linking when no user found")
    void should_CreateContact_WithoutLinking_WhenNoUserFound() {
        // Given
        when(userRepository.findByEmailIgnoreCase("unknown@example.com"))
                .thenReturn(Optional.empty());

        Contact contactWithUnknownEmail = Contact.builder()
                .firstName("Jane")
                .lastName("Smith")
                .email("unknown@example.com")
                .subject("Test Subject")
                .message("Test message")
                .build();

        when(contactRepository.save(any(Contact.class))).thenReturn(contactWithUnknownEmail);

        // When
        Contact result = contactService.createContact(contactWithUnknownEmail);

        // Then
        assertNotNull(result);
        assertNull(contactWithUnknownEmail.getUser());
        verify(userRepository).findByEmailIgnoreCase("unknown@example.com");
        verify(contactRepository).save(contactWithUnknownEmail);
    }

    @Test
    @DisplayName("Should handle null or empty email gracefully")
    void should_HandleNullOrEmptyEmail_Gracefully() {
        // Given
        Contact contactWithNullEmail = Contact.builder()
                .firstName("Test")
                .lastName("User")
                .email(null)
                .subject("Test Subject")
                .message("Test message")
                .build();

        when(contactRepository.save(any(Contact.class))).thenReturn(contactWithNullEmail);

        // When
        Contact result = contactService.createContact(contactWithNullEmail);

        // Then
        assertNotNull(result);
        assertNull(contactWithNullEmail.getUser());
        verify(userRepository, never()).findByEmailIgnoreCase(any());
        verify(contactRepository).save(contactWithNullEmail);
    }

    @Test
    @DisplayName("Should link contact to user successfully")
    void should_LinkContactToUser_Successfully() {
        // Given
        UUID contactId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        when(contactRepository.findById(contactId)).thenReturn(Optional.of(testContact));
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(contactRepository.save(any(Contact.class))).thenReturn(testContact);

        // When
        Optional<Contact> result = contactService.linkContactToUser(contactId, userId);

        // Then
        assertTrue(result.isPresent());
        assertEquals(testUser, testContact.getUser());
        verify(contactRepository).save(testContact);
    }

    @Test
    @DisplayName("Should return empty when contact or user not found for linking")
    void should_ReturnEmpty_WhenContactOrUserNotFound_ForLinking() {
        // Given
        UUID contactId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        when(contactRepository.findById(contactId)).thenReturn(Optional.empty());
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

        // When
        Optional<Contact> result = contactService.linkContactToUser(contactId, userId);

        // Then
        assertFalse(result.isPresent());
        verify(contactRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should unlink contact from user successfully")
    void should_UnlinkContactFromUser_Successfully() {
        // Given
        UUID contactId = UUID.randomUUID();
        testContact.setUser(testUser);

        when(contactRepository.findById(contactId)).thenReturn(Optional.of(testContact));
        when(contactRepository.save(any(Contact.class))).thenReturn(testContact);

        // When
        Optional<Contact> result = contactService.unlinkContactFromUser(contactId);

        // Then
        assertTrue(result.isPresent());
        assertNull(testContact.getUser());
        verify(contactRepository).save(testContact);
    }

    @Test
    @DisplayName("Should delete contact successfully")
    void should_DeleteContact_Successfully() {
        // Given
        UUID contactId = UUID.randomUUID();
        doNothing().when(contactRepository).deleteById(contactId);

        // When & Then
        assertDoesNotThrow(() -> contactService.deleteContact(contactId));
        verify(contactRepository).deleteById(contactId);
    }
}
