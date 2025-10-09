package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.OrganizationDto;
import com.stemadeleine.api.dto.OrganizationSettingsDTO;
import com.stemadeleine.api.model.Media;
import com.stemadeleine.api.model.Page;
import com.stemadeleine.api.service.MediaService;
import com.stemadeleine.api.service.OrganizationService;
import com.stemadeleine.api.service.PageService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = {"http://localhost:3000", "https://stemadeleine.fr"})
@RequiredArgsConstructor
public class PublicController {

    private final PageService pageService;
    private final MediaService mediaService;
    private final OrganizationService organizationService;

    // ==== PUBLIC PAGES ====

    /**
     * Retrieves the tree of visible pages for public navigation
     */
    @GetMapping("/pages/tree")
    public ResponseEntity<List<Page>> getPagesTree() {
        List<Page> visiblePages = pageService.findVisiblePagesHierarchy();
        return ResponseEntity.ok(visiblePages);
    }

    /**
     * Retrieves a public page by its slug
     */
    @GetMapping("/pages/slug/{slug}")
    public ResponseEntity<Page> getPageBySlug(@PathVariable String slug) {
        Optional<Page> page = pageService.findBySlugAndVisible(slug, true);
        return page.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Retrieves a public page by its ID
     */
    @GetMapping("/pages/{id}")
    public ResponseEntity<Page> getPageById(@PathVariable UUID id) {
        Optional<Page> page = pageService.findByIdAndVisible(id, true);
        return page.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Search in public pages
     */
    @GetMapping("/pages/search")
    public ResponseEntity<List<Page>> searchPages(@RequestParam String query) {
        List<Page> pages = pageService.searchInVisiblePages(query);
        return ResponseEntity.ok(pages);
    }

    // ==== PUBLIC ORGANIZATION ====

    /**
     * Retrieves organization settings for public access (including logo)
     */
    @GetMapping("/organization/settings")
    public ResponseEntity<OrganizationSettingsDTO> getOrganizationSettings() {
        try {
            OrganizationSettingsDTO settings = organizationService.getPublicOrganizationSettings();
            return ResponseEntity.ok(settings);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Retrieves organization information for public access (including address)
     */
    @GetMapping("/organization/info")
    public ResponseEntity<OrganizationDto> getOrganizationInfo() {
        try {
            OrganizationDto info = organizationService.getPublicOrganizationInfo();
            return ResponseEntity.ok(info);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ==== PUBLIC MEDIA ====

    /**
     * Redirects to the public URL of a media file by its ID
     */
    @GetMapping("/media/{mediaId}")
    public ResponseEntity<Void> getMediaById(@PathVariable UUID mediaId) {
        try {
            Optional<Media> media = mediaService.getMediaById(mediaId);
            if (media.isPresent()) {
                // Redirection vers l'URL publique du fichier dans Supabase
                return ResponseEntity.status(302)
                        .header("Location", media.get().getFileUrl())
                        .build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Erreur lors de la récupération du média {}: {}", mediaId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}
