package com.stemadeleine.api.service;

import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests unitaires pour UserService")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        testUser = User.builder()
                .id(testUserId)
                .firstname("John")
                .lastname("Doe")
                .build();
    }

    @Test
    @DisplayName("Devrait retourner tous les utilisateurs")
    void shouldReturnAllUsers() {
        // Given
        List<User> users = List.of(testUser);
        when(userRepository.findAll()).thenReturn(users);

        // When
        List<User> result = userService.findAll();

        // Then
        assertEquals(1, result.size());
        assertEquals(testUser.getFirstname(), result.get(0).getFirstname());
        assertEquals(testUser.getLastname(), result.get(0).getLastname());
        verify(userRepository).findAll();
    }

    @Test
    @DisplayName("Devrait retourner un utilisateur par ID")
    void shouldReturnUserById() {
        // Given
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));

        // When
        User result = userService.findById(testUserId);

        // Then
        assertEquals(testUser.getId(), result.getId());
        assertEquals(testUser.getFirstname(), result.getFirstname());
        assertEquals(testUser.getLastname(), result.getLastname());
        verify(userRepository).findById(testUserId);
    }

    @Test
    @DisplayName("Devrait lever une exception quand l'utilisateur n'existe pas")
    void shouldThrowExceptionWhenUserNotFound() {
        // Given
        when(userRepository.findById(testUserId)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.findById(testUserId));
        assertEquals("User not found", exception.getMessage());
        verify(userRepository).findById(testUserId);
    }

    @Test
    @DisplayName("Devrait sauvegarder un utilisateur")
    void shouldSaveUser() {
        // Given
        when(userRepository.save(testUser)).thenReturn(testUser);

        // When
        User result = userService.save(testUser);

        // Then
        assertEquals(testUser.getId(), result.getId());
        assertEquals(testUser.getFirstname(), result.getFirstname());
        assertEquals(testUser.getLastname(), result.getLastname());
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("Devrait mettre à jour un utilisateur existant")
    void shouldUpdateExistingUser() {
        // Given
        User updatedUser = User.builder()
                .firstname("Jane")
                .lastname("Smith")
                .build();

        User expectedUser = User.builder()
                .id(testUserId)
                .firstname("Jane")
                .lastname("Smith")
                .build();

        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(expectedUser);

        // When
        User result = userService.update(testUserId, updatedUser);

        // Then
        assertEquals("Jane", result.getFirstname());
        assertEquals("Smith", result.getLastname());
        verify(userRepository).findById(testUserId);
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Devrait lever une exception lors de la mise à jour d'un utilisateur inexistant")
    void shouldThrowExceptionWhenUpdatingNonExistentUser() {
        // Given
        User updatedUser = User.builder()
                .firstname("Jane")
                .lastname("Smith")
                .build();

        when(userRepository.findById(testUserId)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.update(testUserId, updatedUser));
        assertEquals("User not found", exception.getMessage());
        verify(userRepository).findById(testUserId);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Devrait supprimer un utilisateur")
    void shouldDeleteUser() {
        // When
        userService.delete(testUserId);

        // Then
        verify(userRepository).deleteById(testUserId);
    }

    @Test
    @DisplayName("getUserById devrait retourner un utilisateur")
    void getUserByIdShouldReturnUser() {
        // Given
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));

        // When
        User result = userService.getUserById(testUserId);

        // Then
        assertEquals(testUser.getId(), result.getId());
        assertEquals(testUser.getFirstname(), result.getFirstname());
        assertEquals(testUser.getLastname(), result.getLastname());
        verify(userRepository).findById(testUserId);
    }
}
