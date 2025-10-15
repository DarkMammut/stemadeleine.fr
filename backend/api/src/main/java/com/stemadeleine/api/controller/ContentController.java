package com.stemadeleine.api.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stemadeleine.api.dto.ContentDto;
import com.stemadeleine.api.mapper.ContentMapper;
import com.stemadeleine.api.model.Content;
import com.stemadeleine.api.model.CustomUserDetails;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.service.ContentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/content")
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;
    private final ContentMapper contentMapper;
    private final ObjectMapper objectMapper;

    @GetMapping("/{contentId}")
    public ResponseEntity<ContentDto> getContent(@PathVariable UUID contentId) {
        log.info("GET /api/content/{} - Retrieving content", contentId);

        return contentService.getLatestContentVersion(contentId)
                .map(content -> {
                    log.debug("Content found: {}", content.getId());
                    return ResponseEntity.ok(contentMapper.toDto(content));
                })
                .orElseGet(() -> {
                    log.warn("Content not found with ID: {}", contentId);
                    return ResponseEntity.notFound().build();
                });
    }

    @PutMapping("/{contentId}/title")
    public ResponseEntity<ContentDto> updateContentTitle(
            @PathVariable UUID contentId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            log.error("Attempt to update content title without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = currentUserDetails.account().getUser();
        String title = body.get("title");

        log.info("PUT /api/content/{}/title - Updating content title by user: {}",
                contentId, currentUser.getUsername());

        try {
            // Get current content to preserve body
            Content currentContent = contentService.getLatestContentVersion(contentId)
                    .orElseThrow(() -> new RuntimeException("Content not found: " + contentId));

            Content updatedContent = contentService.createNewVersion(
                    contentId,
                    title,
                    currentContent.getBody(),
                    currentUser
            );
            log.debug("Content title updated: {}", contentId);
            return ResponseEntity.ok(contentMapper.toDto(updatedContent));
        } catch (RuntimeException e) {
            log.error("Error updating content title: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{contentId}/body")
    public ResponseEntity<ContentDto> updateContentBody(
            @PathVariable UUID contentId,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            log.error("Attempt to update content body without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = currentUserDetails.account().getUser();

        log.info("PUT /api/content/{}/body - Updating content body by user: {}",
                contentId, currentUser.getUsername());

        try {
            // Get current content to preserve title
            Content currentContent = contentService.getLatestContentVersion(contentId)
                    .orElseThrow(() -> new RuntimeException("Content not found: " + contentId));

            // Convert body to JsonNode
            JsonNode bodyContent;
            Object bodyObj = body.get("body");
            if (bodyObj instanceof Map) {
                bodyContent = objectMapper.valueToTree(bodyObj);
            } else {
                bodyContent = objectMapper.valueToTree(body);
            }

            Content updatedContent = contentService.createNewVersion(
                    contentId,
                    currentContent.getTitle(),
                    bodyContent,
                    currentUser
            );
            log.debug("Content body updated: {}", contentId);
            return ResponseEntity.ok(contentMapper.toDto(updatedContent));
        } catch (RuntimeException e) {
            log.error("Error updating content body: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{contentId}/visibility")
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

        log.info("PUT /api/content/{}/visibility - Updating content visibility by user: {}",
                contentId, currentUser.getUsername());

        try {
            Content updatedContent = contentService.updateContentVisibility(contentId, isVisible, currentUser);
            log.debug("Content visibility updated: {} -> {}", contentId, isVisible);
            return ResponseEntity.ok(contentMapper.toDto(updatedContent));
        } catch (RuntimeException e) {
            log.error("Error updating content visibility: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{contentId}")
    public ResponseEntity<Void> deleteContent(
            @PathVariable UUID contentId,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            log.error("Attempt to delete content without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = currentUserDetails.account().getUser();
        log.info("DELETE /api/content/{} - Deleting content by user: {}",
                contentId, currentUser.getUsername());

        try {
            contentService.deleteContent(contentId, currentUser);
            log.debug("Content deleted: {}", contentId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("Error deleting content: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/sections/contents/{contentId}")
    public ResponseEntity<ContentDto> updateContentFull(
            @PathVariable UUID contentId,
            @RequestBody ContentDto contentDto,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            log.error("Attempt to update content without authentication");
            throw new RuntimeException("User not authenticated");
        }
        User currentUser = currentUserDetails.account().getUser();

        log.info("PUT /api/sections/contents/{} - Updating content (full) by user: {}", contentId, currentUser.getUsername());

        try {
            // Création d'une nouvelle version avec titre, body et médias
            Content updatedContent = contentService.createNewVersionWithMedias(
                    contentId,
                    contentDto.title(),
                    contentDto.body(),
                    contentDto.medias(),
                    currentUser
            );
            log.debug("Content updated (full): {}", contentId);
            return ResponseEntity.ok(contentMapper.toDto(updatedContent));
        } catch (RuntimeException e) {
            log.error("Error updating content (full): {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/owner/{ownerId}/publish")
    public ResponseEntity<Map<String, Object>> publishAllContentsByOwnerId(
            @PathVariable UUID ownerId,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            log.error("Attempt to publish contents without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = currentUserDetails.account().getUser();
        log.info("POST /api/content/owner/{}/publish - Publishing all contents by user: {}",
                ownerId, currentUser.getUsername());

        try {
            // Récupérer toutes les dernières versions des contenus pour cet ownerId
            var latestContents = contentService.getLatestContentsByOwner(ownerId);

            int publishedCount = 0;
            int skippedCount = 0;

            for (Content content : latestContents) {
                try {
                    // Publier seulement si le contenu n'est pas déjà publié et n'est pas supprimé
                    if (!content.getStatus().equals(com.stemadeleine.api.model.PublishingStatus.PUBLISHED)) {
                        contentService.updateContentStatus(
                                content.getContentId(),
                                com.stemadeleine.api.model.PublishingStatus.PUBLISHED,
                                currentUser
                        );
                        publishedCount++;
                        log.debug("Content published: {} (contentId: {})", content.getId(), content.getContentId());
                    } else {
                        skippedCount++;
                        log.debug("Content already published, skipped: {} (contentId: {})", content.getId(), content.getContentId());
                    }
                } catch (Exception e) {
                    log.warn("Failed to publish content {} (contentId: {}): {}",
                            content.getId(), content.getContentId(), e.getMessage());
                    skippedCount++;
                }
            }

            Map<String, Object> response = Map.of(
                    "ownerId", ownerId,
                    "totalContents", latestContents.size(),
                    "publishedCount", publishedCount,
                    "skippedCount", skippedCount,
                    "message", String.format("Published %d out of %d contents for owner %s",
                            publishedCount, latestContents.size(), ownerId)
            );

            log.info("Bulk publish completed for owner {}: {} published, {} skipped",
                    ownerId, publishedCount, skippedCount);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("Error publishing contents for owner {}: {}", ownerId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Failed to publish contents",
                    "message", e.getMessage(),
                    "ownerId", ownerId
            ));
        }
    }
}
