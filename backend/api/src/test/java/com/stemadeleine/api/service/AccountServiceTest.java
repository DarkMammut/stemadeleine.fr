package com.stemadeleine.api.service;

import com.stemadeleine.api.model.Account;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.AccountRepository;
import com.stemadeleine.api.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests unitaires pour AccountService.changePassword")
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AccountService accountService;

    private Account testAccount;
    private UUID accountId;

    @BeforeEach
    void setUp() {
        accountId = UUID.randomUUID();
        User user = User.builder().id(UUID.randomUUID()).firstname("First").lastname("Last").build();
        testAccount = Account.builder()
                .id(accountId)
                .email("user@example.com")
                .password("encoded-old")
                .provider("local")
                .user(user)
                .build();
    }

    @Test
    @DisplayName("Devrait changer le mot de passe avec succès et invalider le token")
    void shouldChangePasswordAndInvalidateToken() {
        when(accountRepository.findById(accountId)).thenReturn(Optional.of(testAccount));
        when(passwordEncoder.matches("oldPass", "encoded-old")).thenReturn(true);
        when(passwordEncoder.matches("NewPassword1!", "encoded-old")).thenReturn(false);
        when(passwordEncoder.encode("NewPassword1!")).thenReturn("encoded-new");

        accountService.changePassword(accountId, "oldPass", "NewPassword1!", "Bearer some-token");

        verify(accountRepository).save(argThat(acc -> acc.getPassword().equals("encoded-new")));
        verify(jwtUtil).invalidateToken("some-token");
    }

    @Test
    @DisplayName("Devrait échouer si le currentPassword est incorrect")
    void shouldFailIfCurrentPasswordIncorrect() {
        when(accountRepository.findById(accountId)).thenReturn(Optional.of(testAccount));
        when(passwordEncoder.matches("wrong", "encoded-old")).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> accountService.changePassword(accountId, "wrong", "NewPassword1!", null));
        assertEquals("Current password is incorrect", ex.getMessage());
    }

    @Test
    @DisplayName("Devrait échouer si le newPassword est trop court")
    void shouldFailIfNewPasswordTooShort() {
        when(accountRepository.findById(accountId)).thenReturn(Optional.of(testAccount));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> accountService.changePassword(accountId, "oldPass", "short", null));
        assertEquals("New password must be at least 8 characters", ex.getMessage());
    }

    @Test
    @DisplayName("Devrait échouer si le provider n'est pas local")
    void shouldFailIfProviderNotLocal() {
        testAccount.setProvider("google");
        when(accountRepository.findById(accountId)).thenReturn(Optional.of(testAccount));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> accountService.changePassword(accountId, "oldPass", "NewPassword1!", null));
        assertEquals("Cannot change password for external provider accounts", ex.getMessage());
    }

    @Test
    @DisplayName("Devrait échouer si le nouveau mot de passe est identique à l'ancien")
    void shouldFailIfNewPasswordSameAsOld() {
        when(accountRepository.findById(accountId)).thenReturn(Optional.of(testAccount));
        // utiliser un mot de passe qui respecte la longueur minimale
        when(passwordEncoder.matches("oldPassword1", "encoded-old")).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> accountService.changePassword(accountId, "oldPassword1", "oldPassword1", null));
        assertEquals("New password must be different from current password", ex.getMessage());
    }
}
