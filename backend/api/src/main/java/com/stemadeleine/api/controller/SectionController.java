package com.stemadeleine.api.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stemadeleine.api.dto.ContentDto;
import com.stemadeleine.api.dto.SectionDto;
import com.stemadeleine.api.dto.SectionRequest;
import com.stemadeleine.api.mapper.ContentMapper;
import com.stemadeleine.api.mapper.SectionMapper;
import com.stemadeleine.api.model.Content;
import com.stemadeleine.api.model.CustomUserDetails;
import com.stemadeleine.api.model.Section;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.service.ContentService;
import com.stemadeleine.api.service.SectionService;
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
@RequestMapping("/api/sections")
@RequiredArgsConstructor
public class SectionController {

    private final SectionService sectionService;
    private final SectionMapper sectionMapper;
    private final ContentService contentService;
    private final ContentMapper contentMapper;

    @GetMapping
    public List<SectionDto> getAllSections() {
        log.info("GET /api/sections - Retrieving all sections");
        List<Section> sections = sectionService.getAllSections();
        log.debug("Number of sections found: {}", sections.size());
        return sections.stream().map(sectionMapper::toDto).toList();
    }

    @GetMapping("/page/{pageId}")
    public List<Section> getSectionsByPage(@PathVariable UUID pageId) {
        log.info("GET /api/sections/page/{} - Retrieving sections for page (business pageId)", pageId);
        return sectionService.getSectionsByPageId(pageId);
    }

    @GetMapping("/{sectionId}")
    public ResponseEntity<SectionDto> getSectionBySectionId(@PathVariable UUID sectionId) {
        log.info("GET /api/sections/{} - Retrieving section by sectionId", sectionId);
        return sectionService.getLastVersion(sectionId)
                .map(section -> {
                    log.debug("Section found: {}", section.getId());
                    return ResponseEntity.ok(sectionMapper.toDto(section));
                })
                .orElseGet(() -> {
                    log.warn("Section not found with sectionId: {}", sectionId);
                    return ResponseEntity.notFound().build();
                });
    }

    @PostMapping
    public ResponseEntity<SectionDto> createSection(
            @Valid @RequestBody SectionRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            log.error("Attempt to create section without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = currentUserDetails.account().getUser();
        log.info("POST /api/sections - Creating new section for page {}", request.pageId());

        if (request.pageId() == null) {
            throw new RuntimeException("PageId is required for new section");
        }

        Section section = sectionService.createNewSection(request.pageId(), request.name(), currentUser);

        log.debug("Section created successfully: {}", section.getId());
        return ResponseEntity.ok(sectionMapper.toDto(section));
    }

    @PutMapping("/{sectionId}")
    public ResponseEntity<SectionDto> updateSection(
            @PathVariable UUID sectionId,
            @Valid @RequestBody SectionRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            log.error("Attempt to update section without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = currentUserDetails.account().getUser();
        log.info("PUT /api/sections/{} - Updating basic section info by user: {}",
                sectionId, currentUser.getUsername());

        try {
            Section section = sectionService.updateSection(
                    sectionId,
                    request.name(),
                    request.title(),
                    request.isVisible(),
                    currentUser
            );

            log.debug("Section updated successfully: {}", section.getId());
            return ResponseEntity.ok(sectionMapper.toDto(section));
        } catch (RuntimeException e) {
            log.error("Error updating section {}: {}", sectionId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // ----- SECTION VISIBILITY ROUTE -----
    @PutMapping("/{sectionId}/visibility")
    public ResponseEntity<SectionDto> updateSectionVisibility(
            @PathVariable UUID sectionId,
            @RequestBody Map<String, Boolean> body,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            log.error("Attempt to update section visibility without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = currentUserDetails.account().getUser();
        Boolean isVisible = body.get("isVisible");

        log.info("PUT /api/sections/{}/visibility - Updating section visibility to {} by user: {}",
                sectionId, isVisible, currentUser.getUsername());

        try {
            Section section = sectionService.updateSection(
                    sectionId,
                    null,
                    null,
                    isVisible,
                    currentUser
            );

            log.debug("Section visibility updated successfully: {} -> {}", sectionId, isVisible);
            return ResponseEntity.ok(sectionMapper.toDto(section));
        } catch (RuntimeException e) {
            log.error("Error updating section visibility {}: {}", sectionId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // ----- CONTENT MANAGEMENT ROUTES -----

    @PostMapping("/{sectionId}/contents")
    public ResponseEntity<ContentDto> createContent(
            @PathVariable UUID sectionId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            log.error("Attempt to create content without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = currentUserDetails.account().getUser();
        String title = body.getOrDefault("title", "New Content");

        log.info("POST /api/sections/{}/contents - Creating new content by user: {}",
                sectionId, currentUser.getUsername());

        try {
            Content content = sectionService.createNewContent(sectionId, title, currentUser);
            log.debug("Content created successfully: {}", content.getId());
            return ResponseEntity.ok(contentMapper.toDto(content));
        } catch (RuntimeException e) {
            log.error("Error creating content for section {}: {}", sectionId, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{sectionId}/contents")
    public List<ContentDto> getSectionContents(@PathVariable UUID sectionId) {
        log.info("GET /api/sections/{}/contents - Retrieving contents for section", sectionId);
        List<Content> contents = sectionService.getContentsBySection(sectionId);
        log.debug("Found {} contents for section {}", contents.size(), sectionId);
        return contents.stream().map(contentMapper::toDto).toList();
    }

    @PutMapping("/contents/{contentId}")
    public ResponseEntity<ContentDto> updateContent(
            @PathVariable UUID contentId,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            log.error("Attempt to update content without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = currentUserDetails.account().getUser();
        log.info("PUT /api/sections/contents/{} - Updating content by user: {}",
                contentId, currentUser.getUsername());

        try {
            String title = (String) body.get("title");
            Object bodyObj = body.get("body");

            // Convert body to JsonNode properly
            JsonNode contentBody;
            if (bodyObj instanceof Map) {
                // Use ObjectMapper to convert Map to JsonNode
                ObjectMapper objectMapper = new ObjectMapper();
                contentBody = objectMapper.valueToTree(bodyObj);
            } else if (bodyObj instanceof JsonNode) {
                contentBody = (JsonNode) bodyObj;
            } else {
                // Fallback: create default body
                ObjectMapper objectMapper = new ObjectMapper();
                contentBody = objectMapper.createObjectNode().put("html", "<p>Start writing your content here...</p>");
            }

            Content content = contentService.createNewVersion(contentId, title, contentBody, currentUser);
            log.debug("Content updated successfully: {}", content.getId());
            return ResponseEntity.ok(contentMapper.toDto(content));
        } catch (RuntimeException e) {
            log.error("Error updating content {}: {}", contentId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/contents/{contentId}/visibility")
    public ResponseEntity<ContentDto> updateContentVisibility(
            @PathVariable UUID contentId,
            @RequestBody Map<String, Boolean> body,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            log.error("Attempt to update content visibility without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = currentUserDetails.account().getUser();
        Boolean isVisible = body.get("isVisible");

        log.info("PUT /api/sections/contents/{}/visibility - Updating visibility to {} by user: {}",
                contentId, isVisible, currentUser.getUsername());

        try {
            Content content = contentService.updateContentVisibility(contentId, isVisible, currentUser);
            log.debug("Content visibility updated successfully: {}", content.getId());
            return ResponseEntity.ok(contentMapper.toDto(content));
        } catch (RuntimeException e) {
            log.error("Error updating content visibility {}: {}", contentId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/contents/{contentId}")
    public ResponseEntity<Void> deleteContent(
            @PathVariable UUID contentId,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            log.error("Attempt to delete content without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = currentUserDetails.account().getUser();
        log.info("DELETE /api/sections/contents/{} - Deleting content by user: {}",
                contentId, currentUser.getUsername());

        try {
            contentService.deleteContent(contentId, currentUser);
            log.debug("Content deleted successfully: {}", contentId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("Error deleting content {}: {}", contentId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // ----- MEDIA MANAGEMENT ROUTES -----

    @PutMapping("/{sectionId}/media")
    public ResponseEntity<SectionDto> updateSectionMedia(
            @PathVariable UUID sectionId,
            @RequestBody Map<String, UUID> body,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            log.error("Attempt to update section media without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = currentUserDetails.account().getUser();
        UUID mediaId = body.get("mediaId");

        log.info("PUT /api/sections/{}/media - Setting media {} by user: {}",
                sectionId, mediaId, currentUser.getUsername());

        try {
            Section updatedSection = sectionService.setSectionMedia(sectionId, mediaId, currentUser);
            log.debug("Media updated for section: {}", sectionId);
            return ResponseEntity.ok(sectionMapper.toDto(updatedSection));
        } catch (RuntimeException e) {
            log.error("Error updating section media: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{sectionId}/media")
    public ResponseEntity<SectionDto> removeSectionMedia(
            @PathVariable UUID sectionId,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            log.error("Attempt to remove section media without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = currentUserDetails.account().getUser();
        log.info("DELETE /api/sections/{}/media - Removing media by user: {}",
                sectionId, currentUser.getUsername());

        try {
            Section updatedSection = sectionService.removeSectionMedia(sectionId, currentUser);
            log.debug("Media removed for section: {}", sectionId);
            return ResponseEntity.ok(sectionMapper.toDto(updatedSection));
        } catch (RuntimeException e) {
            log.error("Error removing section media: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // ----- SORT ORDER MANAGEMENT -----

    @PutMapping("/sort-order")
    public ResponseEntity<Void> updateSectionSortOrder(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            log.error("Attempt to update section sort order without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = currentUserDetails.account().getUser();
        UUID pageId = UUID.fromString((String) body.get("pageId"));
        @SuppressWarnings("unchecked")
        List<String> sectionIdStrings = (List<String>) body.get("sectionIds");
        List<UUID> sectionIds = sectionIdStrings.stream().map(UUID::fromString).toList();

        log.info("PUT /api/sections/sort-order - Updating sort order for page {} by user: {}",
                pageId, currentUser.getUsername());

        try {
            sectionService.updateSectionSortOrder(pageId, sectionIds, currentUser);
            log.debug("Section sort order updated successfully for page: {}", pageId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("Error updating section sort order: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/contents/sort-order")
    public ResponseEntity<Void> updateContentSortOrder(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            log.error("Attempt to update content sort order without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = currentUserDetails.account().getUser();
        UUID ownerId = UUID.fromString((String) body.get("ownerId"));
        @SuppressWarnings("unchecked")
        List<String> contentIdStrings = (List<String>) body.get("contentIds");
        List<UUID> contentIds = contentIdStrings.stream().map(UUID::fromString).toList();

        log.info("PUT /api/sections/contents/sort-order - Updating content sort order for owner {} by user: {}",
                ownerId, currentUser.getUsername());

        try {
            contentService.updateContentSortOrder(ownerId, contentIds, currentUser);
            log.debug("Content sort order updated successfully for owner: {}", ownerId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("Error updating content sort order: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // ----- CONTENT MEDIA MANAGEMENT ROUTES -----

    @PutMapping("/contents/{contentId}/media")
    public ResponseEntity<ContentDto> addMediaToContent(
            @PathVariable UUID contentId,
            @RequestBody Map<String, UUID> body,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            log.error("Attempt to add media to content without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = currentUserDetails.account().getUser();
        UUID mediaId = body.get("mediaId");

        log.info("PUT /api/sections/contents/{}/media - Adding media {} by user: {}",
                contentId, mediaId, currentUser.getUsername());

        try {
            Content updatedContent = contentService.addMediaToContent(contentId, mediaId, currentUser);
            log.debug("Media added to content successfully: {}", contentId);
            return ResponseEntity.ok(contentMapper.toDto(updatedContent));
        } catch (RuntimeException e) {
            log.error("Error adding media to content {}: {}", contentId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/contents/{contentId}/media/{mediaId}")
    public ResponseEntity<ContentDto> removeMediaFromContent(
            @PathVariable UUID contentId,
            @PathVariable UUID mediaId,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            log.error("Attempt to remove media from content without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = currentUserDetails.account().getUser();
        log.info("DELETE /api/sections/contents/{}/media/{} - Removing media by user: {}",
                contentId, mediaId, currentUser.getUsername());

        try {
            Content updatedContent = contentService.removeMediaFromContent(contentId, mediaId, currentUser);
            log.debug("Media removed from content successfully: {}", contentId);
            return ResponseEntity.ok(contentMapper.toDto(updatedContent));
        } catch (RuntimeException e) {
            log.error("Error removing media from content {}: {}", contentId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{sectionId}")
    public ResponseEntity<Void> deleteSection(
            @PathVariable UUID sectionId,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            log.error("Attempt to delete section without authentication");
            throw new RuntimeException("User not authenticated");
        }
        User currentUser = currentUserDetails.account().getUser();
        sectionService.deleteSection(sectionId, currentUser);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{sectionId}/version")
    public ResponseEntity<SectionDto> createSectionVersion(
            @PathVariable UUID sectionId,
            @Valid @RequestBody SectionRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            log.error("Attempt to create section version without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = currentUserDetails.account().getUser();
        log.info("POST /api/sections/{}/version - Creating new version by user: {}", sectionId, currentUser.getUsername());

        try {
            Section newVersion = sectionService.createSectionVersion(
                    sectionId,
                    request.name(),
                    request.title(),
                    request.isVisible(),
                    currentUser
            );
            log.debug("Section version created successfully: {}", newVersion.getId());
            return ResponseEntity.ok(sectionMapper.toDto(newVersion));
        } catch (Exception e) {
            log.error("Error creating section version: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{sectionId}/publish")
    public ResponseEntity<SectionDto> publishSection(@PathVariable UUID sectionId, @AuthenticationPrincipal CustomUserDetails currentUserDetails) {
        if (currentUserDetails == null) {
            log.error("Attempt to publish section without authentication");
            throw new RuntimeException("User not authenticated");
        }
        User currentUser = currentUserDetails.account().getUser();
        log.info("PUT /api/sections/{}/publish - Publishing section by user: {}", sectionId, currentUser.getUsername());
        Section publishedSection = sectionService.publishSection(sectionId, currentUser);
        return ResponseEntity.ok(sectionMapper.toDto(publishedSection));
    }
}