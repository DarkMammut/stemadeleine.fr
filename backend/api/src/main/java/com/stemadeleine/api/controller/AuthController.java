package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.LoginRequest;
import com.stemadeleine.api.dto.SignupRequest;
import com.stemadeleine.api.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        log.info("POST /api/auth/login - Tentative de connexion pour l'utilisateur : {}", loginRequest.email());
        try {
            var authResponse = authService.authenticateUser(loginRequest);

            // Définir le token JWT dans un cookie HTTPOnly sécurisé
            Cookie jwtCookie = new Cookie("authToken", authResponse.get("token"));
            jwtCookie.setHttpOnly(true);
            jwtCookie.setSecure(false); // true en production avec HTTPS
            jwtCookie.setPath("/");
            jwtCookie.setMaxAge(24 * 60 * 60); // 24 heures
            response.addCookie(jwtCookie);

            log.info("Connexion réussie pour l'utilisateur : {}", loginRequest.email());

            // Retourner seulement un message de succès, pas le token
            Map<String, String> responseBody = new HashMap<>();
            responseBody.put("message", "Login successful");
            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            log.error("Échec de la connexion pour l'utilisateur : {} - Raison : {}",
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
        jwtCookie.setSecure(false); // true en production avec HTTPS
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(0); // Supprime le cookie
        response.addCookie(jwtCookie);

        log.info("Déconnexion réussie - Cookie supprimé");

        Map<String, String> responseBody = new HashMap<>();
        responseBody.put("message", "Logout successful");
        return ResponseEntity.ok(responseBody);
    }
}
