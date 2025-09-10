package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.PageDto;
import com.stemadeleine.api.dto.PageEditDto;
import com.stemadeleine.api.dto.PageRequest;
import com.stemadeleine.api.dto.PageSectionDto;
import com.stemadeleine.api.mapper.PageEditMapper;
import com.stemadeleine.api.mapper.PageMapper;
import com.stemadeleine.api.mapper.PageSectionMapper;
import com.stemadeleine.api.model.CustomUserDetails;
import com.stemadeleine.api.model.Page;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.service.PageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/pages")
@RequiredArgsConstructor
public class PageController {
    private final PageService pageService;
    private final PageMapper pageMapper;
    private final PageEditMapper pageEditMapper;
    private final PageSectionMapper pageSectionMapper;

    // ----- GET -----
    @GetMapping
    public List<PageDto> getAllPages() {
        log.info("GET /api/pages - Récupération de toutes les pages");
        List<Page> pages = pageService.getAllPages();
        log.debug("Nombre de pages trouvées : {}", pages.size());
        return pageMapper.toDtoList(pages);
    }

    @GetMapping("/tree")
    public List<PageDto> getPageTree() {
        log.info("GET /api/pages/tree - Récupération de l'arborescence des pages");
        List<Page> pages = pageService.getLatestPagesForTree();
        log.debug("Nombre de pages dans l'arborescence : {}", pages.size());
        return pageMapper.toDtoList(pages);
    }

    // Routes spécifiques AVANT les routes génériques pour éviter les conflits
    @GetMapping("/slug/{slug}")
    public ResponseEntity<PageDto> getPageBySlug(@PathVariable String slug) {
        log.info("GET /api/pages/slug/{} - Récupération d'une page par slug", slug);
        return pageService.getPublishedPageBySlug(slug)
                .map(page -> {
                    log.debug("Page trouvée par slug : {}", page.getId());
                    return ResponseEntity.ok(pageMapper.toDto(page));
                })
                .orElseGet(() -> {
                    log.warn("Page non trouvée avec le slug : {}", slug);
                    return ResponseEntity.notFound().build();
                });
    }

    @GetMapping("/{pageId}")
    public ResponseEntity<PageEditDto> getPage(@PathVariable UUID pageId) {
        log.info("GET /api/pages/{} - Récupération d'une page par ID", pageId);
        return pageService.getLastVersion(pageId)
                .map(page -> {
                    log.debug("Page trouvée : {}", page.getId());
                    return ResponseEntity.ok(pageEditMapper.toDto(page));
                })
                .orElseGet(() -> {
                    log.warn("Page non trouvée avec l'ID : {}", pageId);
                    return ResponseEntity.notFound().build();
                });
    }

    @GetMapping("/{pageId}/sections")
    public ResponseEntity<PageSectionDto> getPageWithSections(@PathVariable UUID pageId) {
        log.info("GET /api/pages/{}/sections - Récupération d'une page avec ses sections", pageId);
        return pageService.getLastVersion(pageId)
                .map(page -> {
                    log.debug("Page avec sections trouvée : {}", page.getId());
                    // Récupérer les sections filtrées (sans les supprimées) via le service
                    PageSectionDto dto = pageSectionMapper.toDto(page);
                    return ResponseEntity.ok(dto);
                })
                .orElseGet(() -> {
                    log.warn("Page non trouvée avec l'ID : {}", pageId);
                    return ResponseEntity.notFound().build();
                });
    }

    // ----- CREATE NEW PAGE (logique simplifiée comme les sections) -----
    @PostMapping
    public ResponseEntity<PageDto> createPage(
            @Valid @RequestBody PageRequest request,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        if (customUserDetails == null) {
            log.error("Tentative de création de page sans authentification");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = customUserDetails.account().getUser();

        if (request.isNewPage()) {
            log.info("POST /api/pages - Création d'une nouvelle page");
            Page page = pageService.createNewPage(request.parentPageId(), request.name(), currentUser);
            log.debug("Page créée avec succès : {}", page.getId());
            return ResponseEntity.ok(pageMapper.toDto(page));
        } else {
            log.error("Tentative de création de page avec pageId existant - utiliser PUT à la place");
            throw new RuntimeException("Use PUT for updating existing pages");
        }
    }

    // ----- UPDATE PAGE (logique simplifiée comme les sections) -----
    @PutMapping("/{pageId}")
    public ResponseEntity<PageDto> updatePage(
            @PathVariable UUID pageId,
            @Valid @RequestBody PageRequest request,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        if (customUserDetails == null) {
            log.error("Tentative de modification de page sans authentification");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = customUserDetails.account().getUser();
        log.info("PUT /api/pages/{} - Mise à jour des infos de base", pageId);

        Page page = pageService.updatePage(
                pageId,
                request.name(),
                request.title(),
                request.subTitle(),
                request.slug(),
                request.description(),
                request.isVisible(),
                currentUser
        );

        log.debug("Page mise à jour avec succès : {}", page.getId());
        return ResponseEntity.ok(pageMapper.toDto(page));
    }

    // ----- ADD BANNER MEDIA (inchangé) -----
    @PutMapping("/{pageId}/hero-media")
    public ResponseEntity<PageDto> updateHeroMedia(
            @PathVariable UUID pageId,
            @RequestBody Map<String, UUID> body
    ) {
        UUID heroMediaId = body.get("heroMediaId");
        try {
            Page updatedPage = pageService.setHeroMediaLastVersion(pageId, heroMediaId);
            log.debug("Hero media mis à jour pour la page : {}", pageId);
            return ResponseEntity.ok(pageMapper.toDto(updatedPage));
        } catch (RuntimeException e) {
            log.error("Erreur lors de la mise à jour du hero media : {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // ----- REMOVE BANNER MEDIA -----
    @DeleteMapping("/{pageId}/hero-media")
    public ResponseEntity<PageDto> removeHeroMedia(@PathVariable UUID pageId) {
        log.info("DELETE /api/pages/{}/hero-media - Suppression du hero media", pageId);
        try {
            Page updatedPage = pageService.removeHeroMediaLastVersion(pageId);
            log.debug("Hero media supprimé pour la page : {}", pageId);
            return ResponseEntity.ok(pageMapper.toDto(updatedPage));
        } catch (RuntimeException e) {
            log.error("Erreur lors de la suppression du hero media : {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // ----- UPDATE VISIBILITY (route dédiée) -----
    @PutMapping("/{pageId}/visibility")
    public ResponseEntity<PageDto> updateVisibility(
            @PathVariable UUID pageId,
            @RequestBody Boolean isVisible,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        if (customUserDetails == null) {
            log.error("Tentative de modification de visibilité sans authentification");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = customUserDetails.account().getUser();
        log.info("PUT /api/pages/{}/visibility - Mise à jour de la visibilité : {}", pageId, isVisible);

        try {
            Page page = pageService.updatePageVisibility(pageId, isVisible, currentUser);
            log.debug("Visibilité mise à jour pour la page : {}", pageId);
            return ResponseEntity.ok(pageMapper.toDto(page));
        } catch (RuntimeException e) {
            log.error("Erreur lors de la mise à jour de la visibilité : {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // ----- DELETE (logique simplifiée) -----
    @DeleteMapping("/{pageId}")
    public ResponseEntity<Void> deletePage(@PathVariable UUID pageId) {
        log.info("DELETE /api/pages/{} - Suppression logique d'une page", pageId);
        pageService.delete(pageId);
        log.debug("Page supprimée : {}", pageId);
        return ResponseEntity.noContent().build();
    }
}