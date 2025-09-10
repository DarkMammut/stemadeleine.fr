package com.stemadeleine.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stemadeleine.api.config.TestConfig;
import com.stemadeleine.api.dto.LoginRequest;
import com.stemadeleine.api.security.JwtAuthenticationFilter;
import com.stemadeleine.api.security.JwtUtil;
import com.stemadeleine.api.service.AuthService;
import com.stemadeleine.api.service.CustomUserDetailsService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@ActiveProfiles("test")
@Import(TestConfig.class)
@DisplayName("Tests unitaires du contrôleur AuthController")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    @SuppressWarnings("unused")
    private JwtUtil jwtUtil;

    @MockitoBean
    @SuppressWarnings("unused")
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockitoBean
    @SuppressWarnings("unused")
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @DisplayName("POST /api/auth/login - Test de base (peut nécessiter des tests d'intégration pour validation complète)")
    void shouldTestLoginEndpoint() throws Exception {
        // Given
        LoginRequest loginRequest = new LoginRequest("test@example.com", "password123");
        when(authService.authenticateUser(any(LoginRequest.class)))
                .thenReturn(Map.of("token", "jwt-token-123"));

        // When & Then - Test basique du routage
        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk());

        // Note: Pour des tests complets de contenu JSON, utiliser AuthControllerIntegrationTest
    }

    @Test
    @DisplayName("POST /api/auth/logout - Test de base du routage")
    void shouldTestLogoutEndpoint() throws Exception {
        // When & Then - Test basique du routage
        mockMvc.perform(post("/api/auth/logout")
                        .with(csrf()))
                .andExpect(status().isOk());

        // Note: Pour des tests complets de contenu JSON et cookies, utiliser AuthControllerIntegrationTest
    }
}
