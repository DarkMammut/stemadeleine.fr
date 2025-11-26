package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.*;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.service.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
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
    private final ModuleService moduleService;
    private final ContactService contactService;
    private final RecaptchaService recaptchaService;
    private final UserService userService; // ajout de l'injection

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
     * Proxies media file from Supabase to avoid CORS issues on public side
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
            log.error("Error proxying media {}: {}", mediaId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // ==== PUBLIC CONTACT ====

    /**
     * Creates a new contact from a public form
     */
    @PostMapping("/contact")
    public ResponseEntity<?> createContact(@Valid @RequestBody CreateContactRequest request) {
        log.info("New contact received from {} {} - {}", request.getFirstName(), request.getLastName(), request.getEmail());

        try {
            // Validate reCAPTCHA token first
            if (!recaptchaService.validateToken(request.getRecaptchaToken())) {
                log.warn("Invalid reCAPTCHA token for contact from {}", request.getEmail());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Invalid reCAPTCHA verification"));
            }

            // Convert DTO to entity
            Contact contact = Contact.builder()
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .email(request.getEmail())
                    .subject(request.getSubject())
                    .message(request.getMessage())
                    .build();

            // Create contact with automatic linking to user if found
            Contact savedContact = contactService.createContact(contact);

            log.info("Contact created successfully - ID: {}", savedContact.getId());
            return ResponseEntity.status(HttpStatus.CREATED).build();

        } catch (Exception e) {
            log.error("Error creating contact: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Endpoint to subscribe an email to the newsletter.
     * If a user with the given email exists, mark newsletter=true and save.
     * Otherwise create a new user with the email and newsletter=true.
     */
    @PostMapping("/newsletter")
    public ResponseEntity<?> subscribeNewsletter(@Valid @RequestBody CreateNewsletterRequest request) {
        String email = request.getEmail().trim();
        if (email.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Email is required"));
        }

        try {
            // Try to find existing user
            Optional<com.stemadeleine.api.model.User> existing = userService.findByEmailIgnoreCase(email);

            com.stemadeleine.api.model.User user;
            if (existing.isPresent()) {
                user = existing.get();
                user.setNewsletter(true);
                userService.save(user);
                log.info("Updated existing user {} newsletter flag", user.getId());
                return ResponseEntity.ok().build();
            } else {
                // Create minimal user with email and newsletter flag
                user = com.stemadeleine.api.model.User.builder()
                        .email(email)
                        .newsletter(true)
                        .build();
                userService.save(user);
                log.info("Created new user {} for newsletter", user.getEmail());
                return ResponseEntity.status(HttpStatus.CREATED).build();
            }
        } catch (Exception e) {
            log.error("Error subscribing to newsletter for {}: {}", email, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
