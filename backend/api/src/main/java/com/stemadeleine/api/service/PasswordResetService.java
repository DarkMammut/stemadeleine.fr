package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.ForgotPasswordRequest;
import com.stemadeleine.api.dto.ResetPasswordRequest;
import com.stemadeleine.api.model.Account;
import com.stemadeleine.api.model.PasswordResetToken;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.AccountRepository;
import com.stemadeleine.api.repository.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final AccountRepository accountRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    /**
     * Génère un token de réinitialisation et envoie un email
     */
    @Transactional
    public void requestPasswordReset(ForgotPasswordRequest request) {
        String email = request.email();

        Account account = accountRepository.findByEmail(email).orElse(null);

        // Pour des raisons de sécurité, on ne révèle pas si l'email existe ou non
        if (account == null) {
            log.warn("Tentative de réinitialisation pour un email inexistant : {}", email);
            return; // On ne fait rien mais on ne renvoie pas d'erreur
        }

        // Supprime les anciens tokens pour ce compte
        tokenRepository.deleteByAccount(account);

        // Génère un nouveau token unique
        String token = UUID.randomUUID().toString();

        // Le token expire dans 1 heure
        LocalDateTime expiryDate = LocalDateTime.now().plusHours(1);

        // Crée et sauvegarde le token
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .account(account)
                .token(token)
                .expiryDate(expiryDate)
                .used(false)
                .build();

        tokenRepository.save(resetToken);

        // Construit le lien de réinitialisation
        String resetLink = String.format("%s/auth/reset-password?token=%s", frontendUrl, token);

        // Récupère le nom de l'utilisateur
        User user = account.getUser();
        String userName = (user != null && user.getFirstname() != null)
                ? user.getFirstname()
                : "Utilisateur";

        // Envoie l'email
        try {
            emailService.sendPasswordResetEmail(email, resetLink, userName);
            log.info("Email de réinitialisation envoyé à : {}", email);
        } catch (Exception e) {
            log.error("Erreur lors de l'envoi de l'email de réinitialisation à : {}", email, e);
            throw new RuntimeException("Erreur lors de l'envoi de l'email");
        }
    }

    /**
     * Réinitialise le mot de passe avec le token
     */
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String token = request.token();
        String newPassword = request.newPassword();

        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token invalide ou expiré"));

        // Vérifie si le token est valide
        if (!resetToken.isValid()) {
            throw new RuntimeException("Token invalide ou expiré");
        }

        // Récupère le compte
        Account account = resetToken.getAccount();

        // Change le mot de passe
        account.setPassword(passwordEncoder.encode(newPassword));
        accountRepository.save(account);

        // Marque le token comme utilisé
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        log.info("Mot de passe réinitialisé avec succès pour le compte : {}", account.getEmail());
    }

    /**
     * Vérifie si un token est valide
     */
    public boolean validateToken(String token) {
        return tokenRepository.findByToken(token)
                .map(PasswordResetToken::isValid)
                .orElse(false);
    }

    /**
     * Nettoie automatiquement les tokens expirés (tous les jours à 2h du matin)
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        tokenRepository.deleteByExpiryDateBefore(now);
        log.info("Nettoyage des tokens expirés effectué");
    }
}
