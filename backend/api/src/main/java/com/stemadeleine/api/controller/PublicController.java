package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.OrganizationDto;
import com.stemadeleine.api.dto.OrganizationSettingsDTO;
import com.stemadeleine.api.dto.PageDto;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.service.*;
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
    private final SectionService sectionService;
    private final ContentService contentService;
    private final ModuleService moduleService; // Ajout du service Module

    // ==== PUBLIC PAGES ====

    /**
     * Retrieves the tree of visible pages for public navigation
     */
    @GetMapping("/pages/tree")
    public ResponseEntity<List<PageDto>> getPagesTree() {
        List<PageDto> visiblePages = pageService.findVisiblePagesHierarchyDto();
        return ResponseEntity.ok(visiblePages);
    }

    /**
     * Retrieves a public page by its slug
     */
    @GetMapping("/pages/slug")
    public ResponseEntity<Page> getPageBySlug(@RequestParam String slug) {
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

    /**
     * Retrieves published and visible sections for a page by its business pageId
     */
    @GetMapping("/pages/{pageId}/sections")
    public ResponseEntity<List<Section>> getPageSections(@PathVariable UUID pageId) {
        log.info("GET /api/public/pages/{}/sections - Retrieving published and visible sections", pageId);

        try {
            List<Section> sections = sectionService.getPublishedVisibleSectionsByPageId(pageId);
            log.debug("Found {} published sections for pageId: {}", sections.size(), pageId);
            return ResponseEntity.ok(sections);
        } catch (Exception e) {
            log.error("Error retrieving sections for pageId {}: {}", pageId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // ==== PUBLIC MODULES ====

    /**
     * Retrieves published and visible modules for a section by its sectionId
     */
    @GetMapping("/sections/{sectionId}/modules")
    public ResponseEntity<List<Module>> getSectionModules(@PathVariable UUID sectionId) {
        log.info("GET /api/public/sections/{}/modules - Retrieving published and visible modules", sectionId);

        try {
            List<Module> modules = moduleService.getPublishedVisibleModulesBySectionId(sectionId);
            log.debug("Found {} published modules for sectionId: {}", modules.size(), sectionId);
            return ResponseEntity.ok(modules);
        } catch (Exception e) {
            log.error("Error retrieving modules for sectionId {}: {}", sectionId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // ==== PUBLIC CONTENTS ====

    /**
     * Retrieves published and visible contents by ownerId (sectionId, moduleId, etc.)
     */
    @GetMapping("/contents/{ownerId}")
    public ResponseEntity<List<Content>> getContentsByOwnerId(@PathVariable UUID ownerId) {
        log.info("GET /api/public/contents/{} - Retrieving published and visible contents", ownerId);

        try {
            List<Content> contents = contentService.getLatestContentsByOwner(ownerId);

            // Filter only published and visible contents for public access
            List<Content> publicContents = contents.stream()
                    .filter(content -> content.getStatus() == PublishingStatus.PUBLISHED)
                    .filter(Content::getIsVisible)
                    .toList();

            log.debug("Found {} published contents for ownerId: {}", publicContents.size(), ownerId);
            return ResponseEntity.ok(publicContents);
        } catch (Exception e) {
            log.error("Error retrieving contents for ownerId {}: {}", ownerId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
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
     * Proxy le fichier média depuis Supabase pour éviter les problèmes CORS côté public
     */
    @GetMapping("/media/{mediaId}")
    public ResponseEntity<byte[]> proxyMediaById(@PathVariable UUID mediaId) {
        try {
            Optional<Media> media = mediaService.getMediaById(mediaId);
            if (media.isPresent()) {
                String fileUrl = media.get().getFileUrl();
                java.net.URL url = new java.net.URL(fileUrl);
                java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.connect();
                int responseCode = conn.getResponseCode();
                if (responseCode == 200) {
                    String contentType = conn.getContentType();
                    java.io.InputStream is = conn.getInputStream();
                    byte[] bytes = is.readAllBytes();
                    is.close();
                    return ResponseEntity.ok()
                            .header("Content-Type", contentType)
                            .body(bytes);
                } else {
                    return ResponseEntity.status(responseCode).build();
                }
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Erreur lors du proxy du média {}: {}", mediaId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}
