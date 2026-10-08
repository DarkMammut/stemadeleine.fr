package com.stemadeleine.api.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;

/**
 * Service pour gérer l'envoi d'emails avec support des templates Thymeleaf
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.mail.from-name}")
    private String fromName;

    /**
     * Envoie un email simple (texte brut)
     *
     * @param to      destinataire
     * @param subject sujet
     * @param text    corps du message
     */
    @Async
    public void sendSimpleEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(String.format("%s <%s>", fromName, fromEmail));
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);

            mailSender.send(message);
            log.info("Email simple envoyé avec succès à : {}", to);
        } catch (Exception e) {
            log.error("Erreur lors de l'envoi de l'email à : {} - {}", to, e.getMessage(), e);
            throw new RuntimeException("Erreur lors de l'envoi de l'email", e);
        }
    }

    /**
     * Envoie un email HTML en utilisant un template Thymeleaf
     *
     * @param to           destinataire
     * @param subject      sujet
     * @param templateName nom du template Thymeleaf (sans extension)
     * @param variables    variables à injecter dans le template
     */
    @Async
    public void sendTemplatedEmail(String to, String subject, String templateName, Map<String, Object> variables) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // Prépare le contexte Thymeleaf avec les variables
            Context context = new Context();
            context.setVariables(variables);

            // Génère le HTML à partir du template
            String htmlContent = templateEngine.process(templateName, context);

            helper.setFrom(String.format("%s <%s>", fromName, fromEmail));
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = HTML

            mailSender.send(message);
            log.info("Email avec template '{}' envoyé avec succès à : {}", templateName, to);
        } catch (MessagingException e) {
            log.error("Erreur lors de l'envoi de l'email avec template à : {} - {}", to, e.getMessage(), e);
            throw new RuntimeException("Erreur lors de l'envoi de l'email", e);
        }
    }

    /**
     * Envoie un email de réinitialisation de mot de passe
     *
     * @param to        destinataire
     * @param resetLink lien de réinitialisation
     * @param userName  nom de l'utilisateur
     */
    public void sendPasswordResetEmail(String to, String resetLink, String userName) {
        Map<String, Object> variables = Map.of(
                "userName", userName,
                "resetLink", resetLink
        );

        sendTemplatedEmail(
                to,
                "Réinitialisation de votre mot de passe",
                "password-reset-email",
                variables
        );
    }

    /**
     * Envoie un email de confirmation (exemple pour d'autres usages)
     *
     * @param to       destinataire
     * @param userName nom de l'utilisateur
     */
    public void sendWelcomeEmail(String to, String userName) {
        Map<String, Object> variables = Map.of(
                "userName", userName
        );

        sendTemplatedEmail(
                to,
                "Bienvenue sur Sainte Madeleine",
                "welcome-email",
                variables
        );
    }

    /**
     * Envoie une notification (exemple pour d'autres usages)
     *
     * @param to      destinataire
     * @param title   titre de la notification
     * @param message message de la notification
     */
    public void sendNotification(String to, String title, String message) {
        Map<String, Object> variables = Map.of(
                "title", title,
                "message", message
        );

        sendTemplatedEmail(
                to,
                title,
                "notification-email",
                variables
        );
    }
}
