package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.LoginRequest;
import com.stemadeleine.api.dto.SignupRequest;
import com.stemadeleine.api.model.Account;
import com.stemadeleine.api.model.Roles;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.AccountRepository;
import com.stemadeleine.api.repository.UserRepository;
import com.stemadeleine.api.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests unitaires pour AuthService")
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private Account testAccount;
    private LoginRequest loginRequest;
    private SignupRequest signupRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(UUID.randomUUID())
                .firstname("John")
                .lastname("Doe")
                .build();

        testAccount = Account.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .password("encoded-password")
                .role(Roles.ROLE_USER)
                .provider("local")
                .user(testUser)
                .isActive(true)
                .emailVerified(false)
                .build();

        loginRequest = new LoginRequest("test@example.com", "password123");

        signupRequest = new SignupRequest(
                "newuser@example.com",
                "password123",
                "Jane",
                "Smith"
        );
    }

    @Test
    @DisplayName("Devrait authentifier un utilisateur avec des identifiants valides")
    void shouldAuthenticateUserWithValidCredentials() {
        // Given
        String expectedToken = "jwt-token-123";
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(jwtUtil.generateToken(authentication)).thenReturn(expectedToken);

        // When
        Map<String, String> result = authService.authenticateUser(loginRequest);

        // Then
        assertEquals(expectedToken, result.get("token"));
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtUtil).generateToken(authentication);
    }

    @Test
    @DisplayName("Devrait enregistrer un nouvel utilisateur avec succès")
    void shouldRegisterNewUserSuccessfully() {
        // Given
        String encodedPassword = "encoded-password";
        String expectedToken = "jwt-token-123";

        when(accountRepository.existsByEmail(signupRequest.email())).thenReturn(false);
        when(passwordEncoder.encode(signupRequest.password())).thenReturn(encodedPassword);
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(accountRepository.save(any(Account.class))).thenReturn(testAccount);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(jwtUtil.generateToken(authentication)).thenReturn(expectedToken);

        // When
        Map<String, String> result = authService.registerUser(signupRequest);

        // Then
        assertEquals(expectedToken, result.get("token"));
        verify(accountRepository).existsByEmail(signupRequest.email());
        verify(userRepository).save(any(User.class));
        verify(accountRepository).save(any(Account.class));
        verify(passwordEncoder).encode(signupRequest.password());
    }

    @Test
    @DisplayName("Devrait lever une exception pour un email déjà utilisé")
    void shouldThrowExceptionForExistingEmail() {
        // Given
        when(accountRepository.existsByEmail(signupRequest.email())).thenReturn(true);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> authService.registerUser(signupRequest));
        assertEquals("Email is already in use", exception.getMessage());
        verify(accountRepository).existsByEmail(signupRequest.email());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Devrait valider un token valide")
    void shouldValidateValidToken() {
        // Given
        String token = "Bearer valid-token";
        String cleanToken = "valid-token";
        String email = "test@example.com";

        when(jwtUtil.validateToken(cleanToken)).thenReturn(true);
        when(jwtUtil.getEmailFromToken(cleanToken)).thenReturn(email);
        when(accountRepository.findByEmail(email)).thenReturn(Optional.of(testAccount));

        // When
        Map<String, Object> result = authService.validateToken(token);

        // Then
        assertEquals(email, result.get("email"));
        assertEquals(testAccount.getRole(), result.get("role"));
        assertEquals(testUser.getId(), result.get("userId"));
        verify(jwtUtil).validateToken(cleanToken);
        verify(jwtUtil).getEmailFromToken(cleanToken);
        verify(accountRepository).findByEmail(email);
    }

    @Test
    @DisplayName("Devrait lever une exception pour un token invalide")
    void shouldThrowExceptionForInvalidToken() {
        // Given
        String token = "Bearer invalid-token";
        String cleanToken = "invalid-token";

        when(jwtUtil.validateToken(cleanToken)).thenReturn(false);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> authService.validateToken(token));
        assertEquals("Invalid token", exception.getMessage());
        verify(jwtUtil).validateToken(cleanToken);
        verify(jwtUtil, never()).getEmailFromToken(any());
    }

    @Test
    @DisplayName("Devrait lever une exception pour un utilisateur non trouvé lors de la validation")
    void shouldThrowExceptionForUserNotFoundDuringValidation() {
        // Given
        String token = "Bearer valid-token";
        String cleanToken = "valid-token";
        String email = "test@example.com";

        when(jwtUtil.validateToken(cleanToken)).thenReturn(true);
        when(jwtUtil.getEmailFromToken(cleanToken)).thenReturn(email);
        when(accountRepository.findByEmail(email)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> authService.validateToken(token));
        assertEquals("User not found", exception.getMessage());
    }

    @Test
    @DisplayName("Devrait déconnecter un utilisateur")
    void shouldLogoutUser() {
        // Given
        String token = "Bearer jwt-token-123";
        String cleanToken = "jwt-token-123";

        // When
        authService.logoutUser(token);

        // Then
        verify(jwtUtil).invalidateToken(cleanToken);
    }
}
