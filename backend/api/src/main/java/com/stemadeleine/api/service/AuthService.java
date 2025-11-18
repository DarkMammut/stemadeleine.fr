package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.LoginRequest;
import com.stemadeleine.api.dto.SignupRequest;
import com.stemadeleine.api.model.Account;
import com.stemadeleine.api.model.Roles;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.AccountRepository;
import com.stemadeleine.api.repository.UserRepository;
import com.stemadeleine.api.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    public Map<String, String> authenticateUser(LoginRequest loginRequest) {
        log.info("Tentative d'authentification pour l'utilisateur : {}", loginRequest.email());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.password())
        );

        // Vérifier que le compte est actif
        var principal = authentication.getPrincipal();
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails userDetails) {
            // Optional: we can rely on userDetails.isEnabled/isAccountNonLocked etc.
            if (!userDetails.isEnabled() || !userDetails.isAccountNonLocked() || !userDetails.isAccountNonExpired()) {
                log.warn("Compte désactivé ou verrouillé pour l'utilisateur: {}", loginRequest.email());
                throw new com.stemadeleine.api.exception.AccountDisabledException("Account disabled or locked");
            }
        }

        String jwt = jwtUtil.generateToken(authentication);
        log.debug("Token JWT généré avec succès");

        Map<String, String> response = new HashMap<>();
        response.put("token", jwt);
        return response;
    }

    @Transactional
    public Map<String, String> registerUser(SignupRequest request) {
        log.info("Tentative d'inscription pour l'utilisateur : {}", request.email());

        if (accountRepository.existsByEmail(request.email())) {
            log.error("L'email est déjà utilisé : {}", request.email());
            throw new RuntimeException("Email is already in use");
        }

        // Créer un nouvel utilisateur
        User user = User.builder()
                .firstname(request.firstname())
                .lastname(request.lastname())
                .build();
        userRepository.save(user);
        log.debug("Utilisateur créé avec l'ID : {}", user.getId());

        // Créer un nouveau compte
        Account account = Account.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(Roles.ROLE_USER)
                .provider("local")
                .user(user)
                .build();
        accountRepository.save(account);
        log.debug("Compte créé avec l'ID : {}", account.getId());

        // Générer le token JWT
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        String jwt = jwtUtil.generateToken(authentication);
        log.debug("Token JWT généré avec succès");

        Map<String, String> response = new HashMap<>();
        response.put("token", jwt);
        return response;
    }

    public Map<String, Object> validateToken(String token) {
        log.info("Validation du token");

        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        if (!jwtUtil.validateToken(token)) {
            log.error("Token invalide");
            throw new RuntimeException("Invalid token");
        }

        String email = jwtUtil.getEmailFromToken(token);
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Ensure account is active
        if (account.getIsActive() == null || !account.getIsActive()) {
            log.warn("Validation échouée: compte désactivé pour email {}", email);
            throw new com.stemadeleine.api.exception.AccountDisabledException("Account disabled");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("email", email);
        response.put("role", account.getRole());
        response.put("userId", account.getUser().getId());
        return response;
    }

    public void logoutUser(String token) {
        log.info("Déconnexion de l'utilisateur");

        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        // Invalider le token
        jwtUtil.invalidateToken(token);
        log.debug("Token invalidé avec succès");
    }
}
