package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.LoginRequest;
import com.stemadeleine.api.dto.SignupRequest;
import com.stemadeleine.api.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Value("${jwt.cookie.secure:false}")
    private boolean jwtCookieSecure;

    /**
     * Helper method to create a cookie with SameSite attribute
     */
    private void addAuthCookie(HttpServletResponse response, String value, int maxAge) {
        StringBuilder cookieHeader = new StringBuilder();
        cookieHeader.append("authToken=").append(value != null ? value : "");
        cookieHeader.append("; Path=/");
        cookieHeader.append("; Max-Age=").append(maxAge);
        cookieHeader.append("; HttpOnly");

        if (jwtCookieSecure) {
            cookieHeader.append("; Secure");
            cookieHeader.append("; SameSite=None");
        } else {
            cookieHeader.append("; SameSite=Lax");
        }

        response.addHeader("Set-Cookie", cookieHeader.toString());
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        log.info("POST /api/auth/login - Login attempt for user: {}", loginRequest.email());
        try {
            var authResponse = authService.authenticateUser(loginRequest);

            // Set JWT token in a secure HTTPOnly cookie with SameSite attribute
            addAuthCookie(response, authResponse.get("token"), 24 * 60 * 60); // 24 hours

            log.info("Login successful for user: {}", loginRequest.email());

            // Return only a success message, not the token
            Map<String, String> responseBody = new HashMap<>();
            responseBody.put("message", "Login successful");
            return ResponseEntity.ok(responseBody);
        } catch (org.springframework.security.authentication.DisabledException |
                 com.stemadeleine.api.exception.AccountDisabledException ade) {
            log.warn("Login blocked: account disabled - {}", loginRequest.email());
            return ResponseEntity.status(403).body(ade.getMessage());
        } catch (Exception e) {
            log.error("Login failed for user: {} - Reason: {}",
                    loginRequest.email(), e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signupRequest) {
        log.info("POST /api/auth/signup - Tentative d'inscription pour l'utilisateur : {}", signupRequest.email());
        try {
            var response = authService.registerUser(signupRequest);
            log.info("Inscription réussie pour l'utilisateur : {}", signupRequest.email());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Échec de l'inscription pour l'utilisateur : {} - Raison : {}",
                    signupRequest.email(), e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String token) {
        log.info("POST /api/auth/validate - Validation du token");
        try {
            var response = authService.validateToken(token);
            log.debug("Token validé avec succès");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Échec de la validation du token - Raison : {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(HttpServletResponse response) {
        log.info("POST /api/auth/logout - Déconnexion de l'utilisateur");

        // Supprimer le cookie authToken en définissant sa durée à 0
        addAuthCookie(response, null, 0);

        log.info("Déconnexion réussie - Cookie supprimé");

        Map<String, String> responseBody = new HashMap<>();
        responseBody.put("message", "Logout successful");
        return ResponseEntity.ok(responseBody);
    }
}
