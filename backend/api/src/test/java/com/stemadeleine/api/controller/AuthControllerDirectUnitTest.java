package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.LoginRequest;
import com.stemadeleine.api.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerDirectUnitTest {

    @Test
    @DisplayName("authenticateUser - should return 403 when account disabled")
    void authenticateUser_disabled_shouldReturn403() throws Exception {
        // Arrange
        AuthService authService = mock(AuthService.class);
        when(authService.authenticateUser(any())).thenThrow(new com.stemadeleine.api.exception.AccountDisabledException("Account disabled"));
        AuthController controller = new AuthController(authService);
        LoginRequest req = new LoginRequest("disabled@example.com", "pwd");
        MockHttpServletResponse response = new MockHttpServletResponse();

        // Act
        ResponseEntity<?> res = controller.authenticateUser(req, response);

        // Assert
        assertEquals(403, res.getStatusCodeValue());
    }

    @Test
    @DisplayName("authenticateUser - should return 200 and set cookie when success")
    void authenticateUser_success_shouldReturn200AndCookie() throws Exception {
        // Arrange
        AuthService authService = mock(AuthService.class);
        when(authService.authenticateUser(any())).thenReturn(Map.of("token", "jwt-123"));
        AuthController controller = new AuthController(authService);
        LoginRequest req = new LoginRequest("user@example.com", "pwd");
        MockHttpServletResponse response = new MockHttpServletResponse();

        // Act
        ResponseEntity<?> res = controller.authenticateUser(req, response);

        // Assert
        assertEquals(200, res.getStatusCodeValue());
        // cookie should be set in response
        assertEquals(1, response.getCookies().length);
    }
}

