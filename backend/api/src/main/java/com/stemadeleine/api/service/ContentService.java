package com.stemadeleine.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stemadeleine.api.model.Content;
import com.stemadeleine.api.model.PublishingStatus;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.ContentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContentService {

    private final ContentRepository contentRepository;
    private final ObjectMapper objectMapper;

    /**
     * Get all contents ordered by sort order
     */
    public List<Content> getAllContents() {
        log.debug("Retrieving all contents");
        return contentRepository.findAll();
    }

    /**
     * Get content by its database ID
     */
    public Optional<Content> getContentById(UUID id) {
        log.debug("Retrieving content by ID: {}", id);
        return contentRepository.findById(id);
    }

    /**
     * Get the latest version of a content by its logical contentId
     */
    public Optional<Content> getLatestContentVersion(UUID contentId) {
        log.debug("Retrieving latest version of content: {}", contentId);
        return contentRepository.findTopByContentIdOrderByVersionDesc(contentId);
    }

    /**
     * Get contents by owner (section or other entity)
     */
    public List<Content> getContentsByOwner(UUID ownerId) {
        log.debug("Retrieving contents by owner: {}", ownerId);
        return contentRepository.findByOwnerIdOrderBySortOrderAsc(ownerId);
    }

    /**
     * Get latest versions of all contents for a specific owner
     */
    public List<Content> getLatestContentsByOwner(UUID ownerId) {
        log.debug("Retrieving latest contents by owner: {}", ownerId);
        List<Content> latestContents = contentRepository.findLatestContentsByOwner(ownerId);
        log.debug("Found {} latest contents for owner: {}", latestContents.size(), ownerId);
        return latestContents;
    }

    /**
     * Create a new content (first version)
     */
    @Transactional
    public Content createContent(String title, JsonNode body, UUID ownerId, User author) {
        log.info("Creating new content '{}' for owner: {}", title, ownerId);

        UUID contentId = UUID.randomUUID();
        Integer maxSortOrder = contentRepository.findMaxSortOrderByOwner(ownerId);

        Content content = Content.builder()
                .contentId(contentId)
                .ownerId(ownerId)
                .version(1)
                .title(title)
                .body(body)
                .status(PublishingStatus.DRAFT)
                .isVisible(true)
                .sortOrder(maxSortOrder != null ? maxSortOrder + 1 : 1)
                .author(author)
                .build();

        Content savedContent = contentRepository.save(content);
        log.debug("Content created with ID: {} and contentId: {}", savedContent.getId(), savedContent.getContentId());
        return savedContent;
    }

    /**
     * Create a new version of existing content
     */
    @Transactional
    public Content createNewVersion(UUID contentId, String title, JsonNode body, User author) {
        log.info("Creating new version of content: {} by user: {}", contentId, author.getUsername());

        Content latestVersion = getLatestContentVersion(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found: " + contentId));

        Content newVersion = Content.builder()
                .contentId(contentId)
                .ownerId(latestVersion.getOwnerId())
                .version(latestVersion.getVersion() + 1)
                .title(title)
                .body(body)
                .status(PublishingStatus.DRAFT)
                .isVisible(latestVersion.getIsVisible())
                .sortOrder(latestVersion.getSortOrder())
                .author(author)
                .build();

        Content savedContent = contentRepository.save(newVersion);
        log.debug("New content version created: version {} for contentId: {}",
                savedContent.getVersion(), savedContent.getContentId());
        return savedContent;
    }

    /**
     * Update content visibility
     */
    @Transactional
    public Content updateContentVisibility(UUID contentId, Boolean isVisible, User author) {
        log.info("Updating content visibility for: {} to: {} by user: {}",
                contentId, isVisible, author.getUsername());

        Content latestVersion = getLatestContentVersion(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found: " + contentId));

        // Create new version with updated visibility
        Content newVersion = Content.builder()
                .contentId(contentId)
                .ownerId(latestVersion.getOwnerId())
                .version(latestVersion.getVersion() + 1)
                .title(latestVersion.getTitle())
                .body(latestVersion.getBody())
                .status(latestVersion.getStatus())
                .isVisible(isVisible)
                .sortOrder(latestVersion.getSortOrder())
                .author(author)
                .build();

        Content savedContent = contentRepository.save(newVersion);
        log.debug("Content visibility updated: version {} for contentId: {}",
                savedContent.getVersion(), savedContent.getContentId());
        return savedContent;
    }

    /**
     * Delete content (mark as deleted)
     */
    @Transactional
    public Content deleteContent(UUID contentId, User author) {
        log.info("Deleting content: {} by user: {}", contentId, author.getUsername());

        Content latestVersion = getLatestContentVersion(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found: " + contentId));

        // Create new version marked as deleted
        Content deletedVersion = Content.builder()
                .contentId(contentId)
                .ownerId(latestVersion.getOwnerId())
                .version(latestVersion.getVersion() + 1)
                .title(latestVersion.getTitle())
                .body(latestVersion.getBody())
                .status(PublishingStatus.DELETED)
                .isVisible(false)
                .sortOrder(latestVersion.getSortOrder())
                .author(author)
                .build();

        Content savedContent = contentRepository.save(deletedVersion);
        log.debug("Content marked as deleted: version {} for contentId: {}",
                savedContent.getVersion(), savedContent.getContentId());
        return savedContent;
    }

    /**
     * Update content sort order
     */
    @Transactional
    public void updateContentSortOrder(UUID ownerId, List<UUID> contentIds, User author) {
        log.info("Updating content sort order for owner: {} by user: {}", ownerId, author.getUsername());

        for (int i = 0; i < contentIds.size(); i++) {
            UUID contentId = contentIds.get(i);
            Content latestVersion = getLatestContentVersion(contentId)
                    .orElseThrow(() -> new RuntimeException("Content not found: " + contentId));

            if (!latestVersion.getSortOrder().equals(i + 1)) {
                // Create new version with updated sort order
                Content newVersion = Content.builder()
                        .contentId(contentId)
                        .ownerId(latestVersion.getOwnerId())
                        .version(latestVersion.getVersion() + 1)
                        .title(latestVersion.getTitle())
                        .body(latestVersion.getBody())
                        .status(latestVersion.getStatus())
                        .isVisible(latestVersion.getIsVisible())
                        .sortOrder(i + 1)
                        .author(author)
                        .build();

                contentRepository.save(newVersion);
                log.debug("Content sort order updated: contentId {} to position {}", contentId, i + 1);
            }
        }
    }

    /**
     * Create default content body
     */
    public JsonNode createDefaultBody() {
        try {
            return objectMapper.readTree("{\"html\": \"<p>Start writing your content here...</p>\"}");
        } catch (Exception e) {
            log.error("Error creating default content body", e);
            return objectMapper.createObjectNode().put("html", "<p>Start writing your content here...</p>");
        }
    }
}
