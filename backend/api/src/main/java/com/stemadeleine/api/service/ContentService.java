package com.stemadeleine.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stemadeleine.api.model.Content;
import com.stemadeleine.api.model.Media;
import com.stemadeleine.api.model.PublishingStatus;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.ContentRepository;
import com.stemadeleine.api.repository.MediaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContentService {

    private final ContentRepository contentRepository;
    private final MediaRepository mediaRepository;
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
        return contentRepository.findByIdWithMedias(id);
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
        log.info("Retrieving latest contents by owner: {}", ownerId);

        // Vérifier d'abord tous les contenus pour cet owner (debug)
        List<Content> allContents = contentRepository.findByOwnerIdOrderBySortOrderAsc(ownerId);
        log.info("Found {} total contents (all versions) for owner {}", allContents.size(), ownerId);
        for (Content c : allContents) {
            log.info("  - Content id={}, contentId={}, version={}, status={}, title={}",
                    c.getId(), c.getContentId(), c.getVersion(), c.getStatus(), c.getTitle());
        }

        List<Content> latestContents = contentRepository.findLatestContentsByOwner(ownerId);
        log.info("Found {} latest contents (after filtering) for owner: {}", latestContents.size(), ownerId);
        for (Content c : latestContents) {
            log.info("  - Latest: id={}, contentId={}, version={}, status={}, medias: {}",
                    c.getId(), c.getContentId(), c.getVersion(), c.getStatus(),
                    c.getMedias().stream().map(m -> m.getId()).toList());
        }
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

        Content content = new Content();
        content.setContentId(contentId);
        content.setOwnerId(ownerId);
        content.setVersion(1);
        content.setTitle(title);
        content.setBody(body);
        content.setStatus(PublishingStatus.DRAFT);
        content.setIsVisible(true);
        content.setSortOrder(maxSortOrder != null ? maxSortOrder + 1 : 1);
        content.setAuthor(author);

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
                .medias(new ArrayList<>(latestVersion.getMedias())) // Correction : nouvelle instance de la liste
                .build();

        Content savedContent = contentRepository.save(newVersion);
        log.debug("New content version created: version {} for contentId: {}",
                savedContent.getVersion(), savedContent.getContentId());
        return savedContent;
    }

    /**
     * Crée une nouvelle version de contenu avec une liste de médias personnalisée
     */
    @Transactional
    public Content createNewVersionWithMedias(UUID contentId, String title, JsonNode body, List<com.stemadeleine.api.dto.MediaDto> mediasDto, User author) {
        log.info("Creating new version of content (with medias): {} by user: {}", contentId, author.getUsername());

        Content latestVersion = getLatestContentVersion(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found: " + contentId));

        List<Media> medias = new ArrayList<>();
        if (mediasDto != null && !mediasDto.isEmpty()) {
            List<UUID> mediaIds = mediasDto.stream()
                    .map(com.stemadeleine.api.dto.MediaDto::id)
                    .collect(Collectors.toList());
            medias = mediaRepository.findAllById(mediaIds);
        }

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
                .medias(new ArrayList<>(medias)) // Correction : nouvelle instance de la liste
                .build();

        Content savedContent = contentRepository.save(newVersion);
        log.debug("New content version created (with medias): version {} for contentId: {}", savedContent.getVersion(), savedContent.getContentId());
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
        Content newVersion = new Content();
        newVersion.setContentId(contentId);
        newVersion.setOwnerId(latestVersion.getOwnerId());
        newVersion.setVersion(latestVersion.getVersion() + 1);
        newVersion.setTitle(latestVersion.getTitle());
        newVersion.setBody(latestVersion.getBody());
        newVersion.setStatus(latestVersion.getStatus());
        newVersion.setIsVisible(isVisible);
        newVersion.setSortOrder(latestVersion.getSortOrder());
        newVersion.setAuthor(author);

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
        Content deletedVersion = new Content();
        deletedVersion.setContentId(contentId);
        deletedVersion.setOwnerId(latestVersion.getOwnerId());
        deletedVersion.setVersion(latestVersion.getVersion() + 1);
        deletedVersion.setTitle(latestVersion.getTitle());
        deletedVersion.setBody(latestVersion.getBody());
        deletedVersion.setStatus(PublishingStatus.DELETED);
        deletedVersion.setIsVisible(false);
        deletedVersion.setSortOrder(latestVersion.getSortOrder());
        deletedVersion.setAuthor(author);

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
                Content newVersion = new Content();
                newVersion.setContentId(contentId);
                newVersion.setOwnerId(latestVersion.getOwnerId());
                newVersion.setVersion(latestVersion.getVersion() + 1);
                newVersion.setTitle(latestVersion.getTitle());
                newVersion.setBody(latestVersion.getBody());
                newVersion.setStatus(latestVersion.getStatus());
                newVersion.setIsVisible(latestVersion.getIsVisible());
                newVersion.setSortOrder(i + 1);
                newVersion.setAuthor(author);

                contentRepository.save(newVersion);
                log.debug("Content sort order updated: contentId {} to position {}", contentId, i + 1);
            }
        }
    }

    /**
     * Add media to content
     */
    @Transactional
    public Content addMediaToContent(UUID contentId, UUID mediaId, User author) {
        log.info("Adding media {} to content {} by user: {}", mediaId, contentId, author.getUsername());

        Content latestVersion = getLatestContentVersion(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found: " + contentId));

        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new RuntimeException("Media not found: " + mediaId));

        // Create new version with updated medias list
        List<Media> updatedMedias = new ArrayList<>();
        if (latestVersion.getMedias() != null) {
            updatedMedias.addAll(latestVersion.getMedias());
        }

        // Add media only if not already present
        if (!updatedMedias.contains(media)) {
            updatedMedias.add(media);
        }

        // Création d'une nouvelle version sans builder
        Content newVersion = new Content();
        newVersion.setContentId(contentId);
        newVersion.setOwnerId(latestVersion.getOwnerId());
        newVersion.setVersion(latestVersion.getVersion() + 1);
        newVersion.setTitle(latestVersion.getTitle());
        newVersion.setBody(latestVersion.getBody());
        newVersion.setStatus(PublishingStatus.DRAFT);
        newVersion.setIsVisible(latestVersion.getIsVisible());
        newVersion.setSortOrder(latestVersion.getSortOrder());
        newVersion.setAuthor(author);
        newVersion.setMedias(updatedMedias);

        Content savedContent = contentRepository.save(newVersion);
        log.debug("Media added to content: version {} for contentId: {}",
                savedContent.getVersion(), savedContent.getContentId());
        return savedContent;
    }

    /**
     * Remove media from content
     */
    @Transactional
    public Content removeMediaFromContent(UUID contentId, UUID mediaId, User author) {
        log.info("Removing media {} from content {} by user: {}", mediaId, contentId, author.getUsername());

        Content latestVersion = getLatestContentVersion(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found: " + contentId));

        // Create new version with updated medias list (without the specified media)
        List<Media> updatedMedias = new ArrayList<>();
        if (latestVersion.getMedias() != null) {
            updatedMedias = latestVersion.getMedias().stream()
                    .filter(media -> !media.getId().equals(mediaId))
                    .collect(Collectors.toList());
        }

        Content newVersion = new Content();
        newVersion.setContentId(contentId);
        newVersion.setOwnerId(latestVersion.getOwnerId());
        newVersion.setVersion(latestVersion.getVersion() + 1);
        newVersion.setTitle(latestVersion.getTitle());
        newVersion.setBody(latestVersion.getBody());
        newVersion.setStatus(latestVersion.getStatus());
        newVersion.setIsVisible(latestVersion.getIsVisible());
        newVersion.setSortOrder(latestVersion.getSortOrder());
        newVersion.setAuthor(author);
        newVersion.setMedias(updatedMedias);

        Content savedContent = contentRepository.save(newVersion);
        log.debug("Media removed from content: version {} for contentId: {}",
                savedContent.getVersion(), savedContent.getContentId());
        return savedContent;
    }

    /**
     * Update content status (publish, draft, etc.)
     */
    @Transactional
    public Content updateContentStatus(UUID contentId, PublishingStatus status, User author) {
        log.info("Updating content status: contentId={} to status={} by user: {}", contentId, status, author.getUsername());

        Content latestVersion = getLatestContentVersion(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found: " + contentId));

        log.info("Latest version found: id={}, version={}, current status={}",
                latestVersion.getId(), latestVersion.getVersion(), latestVersion.getStatus());

        // Si le statut est déjà le même, on retourne le contenu existant
        if (latestVersion.getStatus().equals(status)) {
            log.info("Content {} already has status {}, no update needed", contentId, status);
            return latestVersion;
        }

        // Mettre à jour directement le statut de la version courante
        log.info("Changing status from {} to {} for content id={}",
                latestVersion.getStatus(), status, latestVersion.getId());

        latestVersion.setStatus(status);
        Content savedContent = contentRepository.save(latestVersion);

        log.info("Content status successfully updated: contentId={}, id={}, version={}, new status={}",
                savedContent.getContentId(), savedContent.getId(), savedContent.getVersion(), savedContent.getStatus());
        return savedContent;
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
