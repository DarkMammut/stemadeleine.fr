package com.stemadeleine.api.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stemadeleine.api.dto.AttachMediaRequest;
import com.stemadeleine.api.dto.ListContentDto;
import com.stemadeleine.api.mapper.ListContentMapper;
import com.stemadeleine.api.model.CustomUserDetails;
import com.stemadeleine.api.model.ListContent;
import com.stemadeleine.api.model.Media;
import com.stemadeleine.api.service.ListContentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/lists")
@RequiredArgsConstructor
public class ListContentController {

    private final ListContentService listContentService;
    private final ListContentMapper listContentMapper;
    private final ObjectMapper objectMapper;

    @GetMapping("/{listId}/contents")
    public java.util.List<ListContentDto> getContents(@PathVariable UUID listId) {
        log.info("GET /api/lists/{}/contents - Retrieving list contents", listId);
        return listContentService.getContentsByListId(listId).stream()
                .map(listContentMapper::toDto)
                .toList();
    }

    @PostMapping("/{listId}/contents")
    public ResponseEntity<ListContentDto> addContent(
            @PathVariable UUID listId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            throw new RuntimeException("User not authenticated");
        }
        String title = body.getOrDefault("title", "Nouveau contenu");
        log.info("POST /api/lists/{}/contents - Adding content '{}'", listId, title);

        try {
            ListContent content = listContentService.addContent(listId, title);
            return ResponseEntity.ok(listContentMapper.toDto(content));
        } catch (RuntimeException e) {
            log.error("Error adding list content: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/contents/{contentId}")
    public ResponseEntity<ListContentDto> updateContent(
            @PathVariable UUID contentId,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            throw new RuntimeException("User not authenticated");
        }
        log.info("PUT /api/lists/contents/{} - Updating list content", contentId);

        try {
            String title = body.get("title") != null ? String.valueOf(body.get("title")) : null;
            String linkUrl = body.get("linkUrl") != null ? String.valueOf(body.get("linkUrl")) : null;

            JsonNode bodyContent = null;
            Object bodyObj = body.get("body");
            if (bodyObj != null) {
                bodyContent = objectMapper.valueToTree(bodyObj);
            }

            ListContent content = listContentService.updateContent(contentId, title, bodyContent, linkUrl);
            return ResponseEntity.ok(listContentMapper.toDto(content));
        } catch (RuntimeException e) {
            log.error("Error updating list content: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/contents/{contentId}/visibility")
    public ResponseEntity<ListContentDto> updateContentVisibility(
            @PathVariable UUID contentId,
            @RequestBody Map<String, Boolean> body,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            throw new RuntimeException("User not authenticated");
        }
        Boolean isVisible = body.get("isVisible");
        log.info("PUT /api/lists/contents/{}/visibility - Updating visibility to {}", contentId, isVisible);

        try {
            ListContent content = listContentService.updateVisibility(contentId, isVisible);
            return ResponseEntity.ok(listContentMapper.toDto(content));
        } catch (RuntimeException e) {
            log.error("Error updating list content visibility: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/contents/{contentId}")
    public ResponseEntity<Void> deleteContent(
            @PathVariable UUID contentId,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            throw new RuntimeException("User not authenticated");
        }
        log.info("DELETE /api/lists/contents/{} - Deleting list content", contentId);

        try {
            listContentService.deleteContent(contentId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("Error deleting list content: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/contents/{contentId}/medias")
    public ResponseEntity<Media> attachMediaToContent(
            @PathVariable UUID contentId,
            @RequestBody AttachMediaRequest request) {
        log.info("POST /api/lists/contents/{}/medias - Attaching media", contentId);
        try {
            Media media = listContentService.attachMedia(contentId, request.mediaId());
            return ResponseEntity.ok(media);
        } catch (RuntimeException e) {
            log.error("Error attaching media to list content: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/contents/{contentId}/medias/{mediaId}")
    public ResponseEntity<Void> detachMediaFromContent(
            @PathVariable UUID contentId,
            @PathVariable UUID mediaId) {
        log.info("DELETE /api/lists/contents/{}/medias/{} - Detaching media", contentId, mediaId);
        try {
            listContentService.detachMedia(contentId, mediaId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("Error detaching media from list content: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}
