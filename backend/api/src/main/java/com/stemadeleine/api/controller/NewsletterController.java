package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.CreateNewsletterRequest;
import com.stemadeleine.api.dto.NewsletterDto;
import com.stemadeleine.api.mapper.NewsletterMapper;
import com.stemadeleine.api.model.CustomUserDetails;
import com.stemadeleine.api.model.Newsletter;
import com.stemadeleine.api.service.NewsletterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/newsletter")
@RequiredArgsConstructor
public class NewsletterController {
    private final NewsletterService newsletterService;
    private final NewsletterMapper newsletterMapper;

    @GetMapping
    public List<NewsletterDto> getAllNewsletters() {
        log.info("GET /api/newsletter - Récupération de toutes les newsletters");
        List<Newsletter> newsletters = newsletterService.getAllNewsletters();
        log.debug("Nombre de newsletters trouvées : {}", newsletters.size());
        return newsletters.stream().map(newsletterMapper::toDto).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<NewsletterDto> getNewsletterById(@PathVariable UUID id) {
        log.info("GET /api/newsletter/{} - Récupération d'une newsletter par ID", id);
        return newsletterService.getNewsletterById(id)
                .map(newsletter -> {
                    log.debug("Newsletter trouvée : {}", newsletter.getId());
                    return ResponseEntity.ok(newsletterMapper.toDto(newsletter));
                })
                .orElseGet(() -> {
                    log.warn("Newsletter non trouvée avec l'ID : {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @PostMapping
    public ResponseEntity<NewsletterDto> createNewsletter(
            @RequestBody CreateNewsletterRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            log.error("Tentative de création de newsletter sans authentification");
            throw new RuntimeException("User not authenticated");
        }

        log.info("POST /api/newsletter - Création d'une nouvelle newsletter");
        Newsletter newsletter = newsletterService.createNewsletterWithModule(
                request,
                currentUserDetails.account().getUser()
        );
        log.debug("Newsletter créée avec l'ID : {}", newsletter.getId());
        return ResponseEntity.ok(newsletterMapper.toDto(newsletter));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NewsletterDto> updateNewsletter(@PathVariable UUID id, @RequestBody Newsletter newsletterDetails) {
        log.info("PUT /api/newsletter/{} - Mise à jour d'une newsletter", id);
        try {
            Newsletter updatedNewsletter = newsletterService.updateNewsletter(id, newsletterDetails);
            log.debug("Newsletter mise à jour : {}", updatedNewsletter.getId());
            return ResponseEntity.ok(newsletterMapper.toDto(updatedNewsletter));
        } catch (RuntimeException e) {
            log.error("Erreur lors de la mise à jour de la newsletter {} : {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNewsletter(@PathVariable UUID id) {
        log.info("DELETE /api/newsletter/{} - Suppression d'une newsletter", id);
        newsletterService.softDeleteNewsletter(id);
        log.debug("Newsletter supprimée : {}", id);
        return ResponseEntity.noContent().build();
    }
}
