package com.stemadeleine.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stemadeleine.api.dto.LoginRequest;
import com.stemadeleine.api.dto.SignupRequest;
import com.stemadeleine.api.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("Tests d'intégration du contrôleur AuthController")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @Test
    @DisplayName("POST /api/auth/login - Devrait authentifier un utilisateur valide")
    void shouldAuthenticateValidUser() throws Exception {
        // Given
        LoginRequest loginRequest = new LoginRequest("test@example.com", "password123");
        when(authService.authenticateUser(any(LoginRequest.class)))
                .thenReturn(Map.of("token", "jwt-token-123"));

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message", is("Login successful")))
                .andExpect(cookie().exists("authToken"));
    }

    @Test
    @DisplayName("POST /api/auth/login - Devrait rejeter des identifiants invalides")
    void shouldRejectInvalidCredentials() throws Exception {
        // Given
        LoginRequest loginRequest = new LoginRequest("test@example.com", "wrongpassword");
        when(authService.authenticateUser(any(LoginRequest.class)))
                .thenThrow(new RuntimeException("Invalid credentials"));

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Invalid credentials"));
    }

    @Test
    @DisplayName("POST /api/auth/signup - Devrait enregistrer un nouvel utilisateur")
    void shouldRegisterNewUser() throws Exception {
        // Given
        SignupRequest signupRequest = new SignupRequest(
                "newuser@example.com",
                "newpassword123",
                "New",
                "User"
        );
        when(authService.registerUser(any(SignupRequest.class)))
                .thenReturn(Map.of("token", "jwt-token-456"));

        // When & Then
        mockMvc.perform(post("/api/auth/signup")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.token", is("jwt-token-456")));
    }

    @Test
    @DisplayName("POST /api/auth/signup - Devrait rejeter un email déjà existant")
    void shouldRejectExistingEmail() throws Exception {
        // Given
        SignupRequest signupRequest = new SignupRequest(
                "existing@example.com",
                "password123",
                "Another",
                "User"
        );
        when(authService.registerUser(any(SignupRequest.class)))
                .thenThrow(new RuntimeException("Email is already in use"));

        // When & Then
        mockMvc.perform(post("/api/auth/signup")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Email is already in use"));
    }

    @Test
    @DisplayName("POST /api/auth/logout - Devrait déconnecter l'utilisateur")
    void shouldLogoutUser() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/auth/logout")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message", is("Logout successful")))
                .andExpect(cookie().exists("authToken"))
                .andExpect(cookie().maxAge("authToken", 0));
    }
}
