package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.SectionDto;
import com.stemadeleine.api.dto.SectionRequest;
import com.stemadeleine.api.mapper.SectionMapper;
import com.stemadeleine.api.model.CustomUserDetails;
import com.stemadeleine.api.model.Section;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.service.SectionService;
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
@RequestMapping("/api/sections")
@RequiredArgsConstructor
public class SectionController {

    private final SectionService sectionService;
    private final SectionMapper sectionMapper;

    @GetMapping
    public List<SectionDto> getAllSections() {
        log.info("GET /api/sections - Récupération de toutes les sections");
        List<Section> sections = sectionService.getAllSections();
        log.debug("Nombre de sections trouvées : {}", sections.size());
        return sections.stream().map(sectionMapper::toDto).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SectionDto> getSectionById(@PathVariable UUID id) {
        log.info("GET /api/sections/{} - Récupération d'une section par ID", id);
        return sectionService.getSectionById(id)
                .map(section -> {
                    log.debug("Section trouvée : {}", section.getId());
                    return ResponseEntity.ok(sectionMapper.toDto(section));
                })
                .orElseGet(() -> {
                    log.warn("Section non trouvée avec l'ID : {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @GetMapping("/page/{pageId}")
    public List<Section> getSectionsByPage(@PathVariable UUID pageId) {
        log.info("GET /api/sections/page/{} - Récupération des sections d'une page", pageId);
        return sectionService.getSectionsByPage(pageId);
    }

    @PostMapping
    public ResponseEntity<SectionDto> createSection(
            @Valid @RequestBody SectionRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            log.error("Tentative de création de section sans authentification");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = currentUserDetails.account().getUser();
        log.info("POST /api/sections - Création d'une nouvelle section pour la page {}", request.pageId());

        if (request.pageId() == null) {
            throw new RuntimeException("PageId is required for new section");
        }

        Section section = sectionService.createNewSection(request.pageId(), request.name(), currentUser);

        log.debug("Section créée avec succès : {}", section.getId());
        return ResponseEntity.ok(sectionMapper.toDto(section));
    }

    @PutMapping("/{sectionId}")
    public ResponseEntity<SectionDto> updateSection(
            @PathVariable UUID sectionId,
            @Valid @RequestBody SectionRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            log.error("Tentative de modification de section sans authentification");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = currentUserDetails.account().getUser();
        log.info("PUT /api/sections/{} - Mise à jour des infos de base", sectionId);

        Section section = sectionService.updateSection(
                sectionId,
                request.name(),
                request.title(),
                request.isVisible(),
                currentUser
        );

        log.debug("Section mise à jour avec succès : {}", section.getId());
        return ResponseEntity.ok(sectionMapper.toDto(section));
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSection(@PathVariable UUID id) {
        log.info("DELETE /api/sections/{} - Suppression d'une section", id);
        sectionService.deleteSection(id);
        log.debug("Section supprimée avec succès : {}", id);
        return ResponseEntity.noContent().build();
    }
}