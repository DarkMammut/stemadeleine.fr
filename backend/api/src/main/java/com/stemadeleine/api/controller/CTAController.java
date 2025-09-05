package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.CTADto;
import com.stemadeleine.api.dto.CreateCTARequest;
import com.stemadeleine.api.dto.UpdateCTARequest;
import com.stemadeleine.api.mapper.CTAMapper;
import com.stemadeleine.api.model.CTA;
import com.stemadeleine.api.model.CustomUserDetails;
import com.stemadeleine.api.service.CTAService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/cta")
@RequiredArgsConstructor
public class CTAController {
    private final CTAService ctaService;
    private final CTAMapper ctaMapper;

    @GetMapping
    public List<CTADto> getAllCTAs() {
        log.info("GET /api/cta - Récupération de tous les CTA");
        List<CTA> ctas = ctaService.getAllCTAs();
        log.debug("Nombre de CTAs trouvés : {}", ctas.size());
        return ctas.stream()
                .map(ctaMapper::toDto)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CTADto> getCTAById(@PathVariable UUID id) {
        log.info("GET /api/cta/{} - Récupération d'un CTA par ID", id);
        return ctaService.getCTAById(id)
                .map(cta -> {
                    log.debug("CTA trouvé : {}", cta.getId());
                    return ResponseEntity.ok(ctaMapper.toDto(cta));
                })
                .orElseGet(() -> {
                    log.warn("CTA non trouvé avec l'ID : {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @PostMapping
    public ResponseEntity<CTADto> createCTA(
            @Valid @RequestBody CreateCTARequest request,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            log.error("Tentative de création de CTA sans authentification");
            throw new RuntimeException("User not authenticated");
        }

        log.info("POST /api/cta - Création d'un nouveau CTA");
        CTA cta = ctaService.createCTAWithModule(
                request,
                currentUserDetails.account().getUser()
        );
        log.debug("CTA créé avec l'ID : {}", cta.getId());
        return ResponseEntity.ok(ctaMapper.toDto(cta));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CTADto> updateCTA(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateCTARequest request,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        log.info("PUT /api/cta/{} - Mise à jour d'un CTA", id);
        try {
            CTA updatedCTA = ctaService.updateCTA(id, request, customUserDetails.account().getUser());
            log.debug("CTA mis à jour : {}", updatedCTA.getId());
            return ResponseEntity.ok(ctaMapper.toDto(updatedCTA));
        } catch (RuntimeException e) {
            log.error("Erreur lors de la mise à jour du CTA {} : {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCTA(@PathVariable UUID id) {
        log.info("DELETE /api/cta/{} - Suppression d'un CTA", id);
        ctaService.softDeleteCTA(id);
        log.debug("CTA supprimé : {}", id);
        return ResponseEntity.noContent().build();
    }
}
