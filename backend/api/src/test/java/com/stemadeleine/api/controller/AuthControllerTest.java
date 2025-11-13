package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.LoginRequest;
import com.stemadeleine.api.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests unitaires du contrôleur AuthController")
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @BeforeEach
    void setup() {
        // ensure mocks are non-null
        assertNotNull(authService);
    }

    @Test
    @DisplayName("POST /api/auth/login - Test de base (peut nécessiter des tests d'intégration pour validation complète)")
    void shouldTestLoginEndpoint() {
        // Given
        LoginRequest loginRequest = new LoginRequest("test@example.com", "password123");
        when(authService.authenticateUser(any(LoginRequest.class)))
                .thenReturn(Map.of("token", "jwt-token-123"));

        // When & Then - call controller directly
        AuthController controller = new AuthController(authService);
        MockHttpServletResponse response = new MockHttpServletResponse();
        var entity = controller.authenticateUser(loginRequest, response);
        assertEquals(HttpStatus.OK, entity.getStatusCode());

        // Note: Pour des tests complets de contenu JSON, utiliser AuthControllerIntegrationTest
    }

    @Test
    @DisplayName("POST /api/auth/logout - Test de base du routage")
    void shouldTestLogoutEndpoint() {
        // When & Then - call controller directly
        AuthController controller = new AuthController(authService);
        MockHttpServletResponse response = new MockHttpServletResponse();
        var entity = controller.logoutUser(response);
        assertEquals(HttpStatus.OK, entity.getStatusCode());

        // Note: Pour des tests complets de contenu JSON et cookies, utiliser AuthControllerIntegrationTest
    }

    @Test
    @DisplayName("POST /api/auth/login - Bloqué si compte désactivé (unit)")
    void shouldReturnForbiddenWhenAccountDisabled() {
        // Given
        LoginRequest loginRequest = new LoginRequest("disabled@example.com", "password123");

        // When & Then - call a fresh controller instance with a local mock to avoid MockMvc wiring subtleties
        AuthService localAuthMock = org.mockito.Mockito.mock(AuthService.class);
        org.mockito.Mockito.doAnswer(invocation -> {
            throw new com.stemadeleine.api.exception.AccountDisabledException("Account disabled");
        }).when(localAuthMock).authenticateUser(any(LoginRequest.class));
        AuthController localController = new AuthController(localAuthMock);
        MockHttpServletResponse response = new MockHttpServletResponse();
        var entity = localController.authenticateUser(loginRequest, response);
        assertEquals(HttpStatus.FORBIDDEN, entity.getStatusCode());
        // Verify mock was invoked
        org.mockito.Mockito.verify(localAuthMock).authenticateUser(any(LoginRequest.class));
    }
}
