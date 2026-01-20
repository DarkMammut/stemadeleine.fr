package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.ForgotPasswordRequest;
import com.stemadeleine.api.dto.LoginRequest;
import com.stemadeleine.api.dto.ResetPasswordRequest;
import com.stemadeleine.api.dto.SignupRequest;
import com.stemadeleine.api.service.AuthService;
import com.stemadeleine.api.service.PasswordResetService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
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
    private final PasswordResetService passwordResetService;

    @Value("${jwt.cookie.secure:false}")
    private boolean jwtCookieSecure;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        log.info("POST /api/auth/login - Login attempt for user: {}", loginRequest.email());
        try {
            var authResponse = authService.authenticateUser(loginRequest);

            // Set JWT token in a secure HTTPOnly cookie
            Cookie jwtCookie = new Cookie("authToken", authResponse.get("token"));
            jwtCookie.setHttpOnly(true);
            jwtCookie.setSecure(jwtCookieSecure);
            jwtCookie.setPath("/");
            jwtCookie.setMaxAge(24 * 60 * 60); // 24 hours
            response.addCookie(jwtCookie);

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
        Cookie jwtCookie = new Cookie("authToken", null);
        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(jwtCookieSecure);
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(0); // Supprime le cookie
        response.addCookie(jwtCookie);

        log.info("Déconnexion réussie - Cookie supprimé");

        Map<String, String> responseBody = new HashMap<>();
        responseBody.put("message", "Logout successful");
        return ResponseEntity.ok(responseBody);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        log.info("POST /api/auth/forgot-password - Demande de réinitialisation pour : {}", request.email());
        try {
            passwordResetService.requestPasswordReset(request);

            Map<String, String> responseBody = new HashMap<>();
            responseBody.put("message", "Si cet email existe, un lien de réinitialisation a été envoyé");
            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            log.error("Erreur lors de la demande de réinitialisation pour : {} - Raison : {}",
                    request.email(), e.getMessage());
            // On renvoie toujours le même message pour ne pas révéler si l'email existe
            Map<String, String> responseBody = new HashMap<>();
            responseBody.put("message", "Si cet email existe, un lien de réinitialisation a été envoyé");
            return ResponseEntity.ok(responseBody);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        log.info("POST /api/auth/reset-password - Tentative de réinitialisation avec token");
        try {
            passwordResetService.resetPassword(request);

            Map<String, String> responseBody = new HashMap<>();
            responseBody.put("message", "Mot de passe réinitialisé avec succès");
            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            log.error("Échec de la réinitialisation du mot de passe - Raison : {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/validate-reset-token")
    public ResponseEntity<?> validateResetToken(@RequestParam String token) {
        log.info("GET /api/auth/validate-reset-token - Validation du token de réinitialisation");
        try {
            boolean isValid = passwordResetService.validateToken(token);

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("valid", isValid);
            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            log.error("Erreur lors de la validation du token - Raison : {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("valid", false));
        }
    }
}
