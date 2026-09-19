package com.stemadeleine.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stemadeleine.api.dto.MediaDto;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class ContentService {

    private final ContentRepository contentRepository;
    private final MediaRepository mediaRepository;
    private final ObjectMapper objectMapper;

    /**
     * Get all contents.
     */
    public List<Content> getAllContents() {
        return contentRepository.findAll();
    }

    /**
     * Get content by database ID.
     */
    public Optional<Content> getContentById(UUID id) {
        return contentRepository.findByIdWithMedias(id);
    }

    /**
     * Get the current working version of a content.
     * <p>
     * Priority:
     * 1. DRAFT
     * 2. PUBLISHED
     * <p>
     * There should never be another status returned here.
     */
    public Optional<Content> getLatestContentVersion(UUID contentId) {
        return contentRepository.findByContentIdAndStatus(
                contentId,
                PublishingStatus.DRAFT
        ).or(() -> contentRepository.findByContentIdAndStatus(
                contentId,
                PublishingStatus.PUBLISHED
        ));
    }

    /**
     * Get the draft of a content.
     */
    public Optional<Content> getDraft(UUID contentId) {
        return contentRepository.findByContentIdAndStatus(
                contentId,
                PublishingStatus.DRAFT
        );
    }

    /**
     * Get the published version of a content.
     */
    public Optional<Content> getPublished(UUID contentId) {
        return contentRepository.findByContentIdAndStatus(
                contentId,
                PublishingStatus.PUBLISHED
        );
    }

    /**
     * Get contents for an owner.
     * <p>
     * Backoffice = DRAFT contents.
     */
    public List<Content> getContentsByOwner(UUID ownerId) {
        return contentRepository.findByOwnerIdAndStatusOrderBySortOrderAsc(
                ownerId,
                PublishingStatus.DRAFT
        );
    }

    /**
     * Get published contents for an owner.
     * <p>
     * Public side = PUBLISHED contents only.
     */
    public List<Content> getPublishedContentsByOwner(UUID ownerId) {
        return contentRepository.findByOwnerIdAndStatusOrderBySortOrderAsc(
                ownerId,
                PublishingStatus.PUBLISHED
        );
    }

    /**
     * Compatibility method for the existing controller.
     * <p>
     * The old implementation returned the latest version regardless
     * of its status. We now return the working DRAFT, or PUBLISHED
     * when no draft exists.
     */
    public List<Content> getLatestContentsByOwner(UUID ownerId) {
        return getContentsByOwner(ownerId);
    }

    /**
     * Create a new content.
     * <p>
     * A new content starts with a DRAFT only.
     */
    @Transactional
    public Content createContent(
            String title,
            JsonNode body,
            UUID ownerId,
            User author
    ) {
        log.info(
                "Creating new content '{}' for owner {}",
                title,
                ownerId
        );

        UUID contentId = UUID.randomUUID();

        Integer maxSortOrder =
                contentRepository.findMaxSortOrderByOwnerAndStatus(
                        ownerId,
                        PublishingStatus.DRAFT
                );

        Content content = new Content();

        content.setContentId(contentId);
        content.setOwnerId(ownerId);
        content.setVersion(1);
        content.setTitle(title);
        content.setBody(body);
        content.setStatus(PublishingStatus.DRAFT);
        content.setIsVisible(true);
        content.setSortOrder(
                maxSortOrder != null
                        ? maxSortOrder + 1
                        : 1
        );
        content.setAuthor(author);

        return contentRepository.save(content);
    }

    /**
     * Update the existing DRAFT.
     * <p>
     * If no DRAFT exists, create one from the PUBLISHED version.
     * <p>
     * Every actual update increments the version.
     */
    @Transactional
    public Content createNewVersion(
            UUID contentId,
            String title,
            JsonNode body,
            User author
    ) {
        Content draft = getOrCreateDraft(contentId, author);

        draft.setVersion(draft.getVersion() + 1);
        draft.setTitle(title);
        draft.setBody(body);
        draft.setStatus(PublishingStatus.DRAFT);
        draft.setAuthor(author);

        return contentRepository.save(draft);
    }

    /**
     * Update the existing DRAFT including its media.
     */
    @Transactional
    public Content createNewVersionWithMedias(
            UUID contentId,
            String title,
            JsonNode body,
            List<MediaDto> mediasDto,
            User author
    ) {
        Content draft = getOrCreateDraft(contentId, author);

        List<Media> medias = new ArrayList<>();

        if (mediasDto != null && !mediasDto.isEmpty()) {
            List<UUID> mediaIds = mediasDto.stream()
                    .map(MediaDto::id)
                    .toList();

            medias.addAll(mediaRepository.findAllById(mediaIds));
        }

        draft.setVersion(draft.getVersion() + 1);
        draft.setTitle(title);
        draft.setBody(body);
        draft.setStatus(PublishingStatus.DRAFT);
        draft.setAuthor(author);

        draft.getMedias().clear();
        draft.getMedias().addAll(medias);

        return contentRepository.save(draft);
    }

    /**
     * Update content visibility on the DRAFT.
     */
    @Transactional
    public Content updateContentVisibility(
            UUID contentId,
            Boolean isVisible,
            User author
    ) {
        Content draft = getOrCreateDraft(contentId, author);

        draft.setVersion(draft.getVersion() + 1);
        draft.setIsVisible(isVisible);
        draft.setAuthor(author);
        draft.setStatus(PublishingStatus.DRAFT);

        return contentRepository.save(draft);
    }

    /**
     * Update content sort order.
     * <p>
     * Only the DRAFT is modified.
     */
    @Transactional
    public void updateContentSortOrder(
            UUID ownerId,
            List<UUID> contentIds,
            User author
    ) {
        log.info(
                "Updating content sort order for owner {}",
                ownerId
        );

        for (int i = 0; i < contentIds.size(); i++) {
            UUID contentId = contentIds.get(i);
            int newSortOrder = i + 1;

            Content draft = getOrCreateDraft(contentId, author);

            if (!Integer.valueOf(newSortOrder).equals(draft.getSortOrder())) {
                draft.setVersion(draft.getVersion() + 1);
                draft.setSortOrder(newSortOrder);
                draft.setAuthor(author);

                contentRepository.save(draft);
            }
        }
    }

    @Transactional
    public Content resetDraftToPublished(UUID contentId, User author) {

        Content published = getPublished(contentId)
                .orElseThrow(() ->
                        new RuntimeException("Published content not found: " + contentId)
                );

        Content draft = getDraft(contentId)
                .orElseThrow(() ->
                        new RuntimeException("Draft not found: " + contentId)
                );

        draft.setVersion(draft.getVersion() + 1);

        draft.setOwnerId(published.getOwnerId());
        draft.setTitle(published.getTitle());
        draft.setBody(published.getBody());
        draft.setSortOrder(published.getSortOrder());
        draft.setIsVisible(published.getIsVisible());
        draft.setAuthor(author);

        synchronizeMedias(draft, published);

        return contentRepository.save(draft);
    }

    /**
     * Add a media to the DRAFT.
     */
    @Transactional
    public Content addMediaToContent(
            UUID contentId,
            UUID mediaId,
            User author
    ) {
        Content draft = getOrCreateDraft(contentId, author);

        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Media not found: " + mediaId
                        )
                );

        if (!draft.getMedias().contains(media)) {
            draft.getMedias().add(media);

            draft.setVersion(draft.getVersion() + 1);
            draft.setAuthor(author);
        }

        return contentRepository.save(draft);
    }

    /**
     * Remove a media from the DRAFT.
     */
    @Transactional
    public Content removeMediaFromContent(
            UUID contentId,
            UUID mediaId,
            User author
    ) {
        Content draft = getOrCreateDraft(contentId, author);

        boolean removed = draft.getMedias()
                .removeIf(media -> media.getId().equals(mediaId));

        if (removed) {
            draft.setVersion(draft.getVersion() + 1);
            draft.setAuthor(author);
        }

        return contentRepository.save(draft);
    }

    /**
     * Publish the DRAFT.
     * <p>
     * First publication:
     * DRAFT exists
     * PUBLISHED does not exist
     * -> create PUBLISHED
     * <p>
     * Subsequent publication:
     * DRAFT exists
     * PUBLISHED exists
     * -> update existing PUBLISHED
     * <p>
     * No third row is ever created.
     */
    @Transactional
    public Content publishContent(
            UUID contentId,
            User author
    ) {
        Content draft = getDraft(contentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Draft not found: " + contentId
                        )
                );

        Optional<Content> publishedOptional =
                getPublished(contentId);

        Content published;

        if (publishedOptional.isPresent()) {
            published = publishedOptional.get();

            published.setVersion(draft.getVersion());
            published.setOwnerId(draft.getOwnerId());
            published.setTitle(draft.getTitle());
            published.setBody(draft.getBody());
            published.setSortOrder(draft.getSortOrder());
            published.setIsVisible(draft.getIsVisible());
            published.setAuthor(author);

            synchronizeMedias(published, draft);

        } else {
            published = Content.builder()
                    .contentId(draft.getContentId())
                    .ownerId(draft.getOwnerId())
                    .version(draft.getVersion())
                    .title(draft.getTitle())
                    .body(draft.getBody())
                    .status(PublishingStatus.PUBLISHED)
                    .isVisible(draft.getIsVisible())
                    .sortOrder(draft.getSortOrder())
                    .author(author)
                    .medias(new ArrayList<>(draft.getMedias()))
                    .build();
        }

        published.setStatus(PublishingStatus.PUBLISHED);

        return contentRepository.save(published);
    }

    /**
     * Publish all drafts for an owner.
     */
    @Transactional
    public int publishAllContentsByOwner(
            UUID ownerId,
            User author
    ) {
        log.info(
                "Starting publication of all contents for owner {}",
                ownerId
        );

        List<Content> drafts =
                contentRepository.findByOwnerIdAndStatusOrderBySortOrderAsc(
                        ownerId,
                        PublishingStatus.DRAFT
                );

        log.info(
                "Found {} DRAFT contents for owner {}",
                drafts.size(),
                ownerId
        );

        int publishedCount = 0;

        for (Content draft : drafts) {

            log.info(
                    "Publishing content: id={}, contentId={}, version={}, status={}",
                    draft.getId(),
                    draft.getContentId(),
                    draft.getVersion(),
                    draft.getStatus()
            );

            Content published =
                    publishContent(
                            draft.getContentId(),
                            author
                    );

            log.info(
                    "Content published: id={}, contentId={}, version={}, status={}",
                    published.getId(),
                    published.getContentId(),
                    published.getVersion(),
                    published.getStatus()
            );

            publishedCount++;
        }

        log.info(
                "Finished publication for owner {}: {} contents published",
                ownerId,
                publishedCount
        );

        return publishedCount;
    }

    /**
     * Check whether the DRAFT contains changes compared to PUBLISHED.
     */
    @Transactional(readOnly = true)
    public boolean hasDraftChanges(UUID contentId) {
        Optional<Content> draft = getDraft(contentId);

        if (draft.isEmpty()) {
            return false;
        }

        Optional<Content> published = getPublished(contentId);

        return published.isEmpty()
                || !draft.get().getVersion()
                .equals(published.get().getVersion());
    }

    /**
     * Delete a content.
     * <p>
     * DRAFT -> DELETED
     * PUBLISHED -> ARCHIVED
     * <p>
     * No new version is created.
     */
    @Transactional
    public Content deleteContent(
            UUID contentId,
            User author
    ) {
        Content draft = getDraft(contentId)
                .orElse(null);

        Content published = getPublished(contentId)
                .orElse(null);

        if (draft == null && published == null) {
            throw new RuntimeException(
                    "Content not found: " + contentId
            );
        }

        if (draft != null) {
            draft.setStatus(PublishingStatus.DELETED);
            draft.setIsVisible(false);
            draft.setAuthor(author);

            contentRepository.save(draft);
        }

        if (published != null) {
            published.setStatus(PublishingStatus.ARCHIVED);
            published.setIsVisible(false);
            published.setAuthor(author);

            contentRepository.save(published);
        }

        return draft != null ? draft : published;
    }

    /**
     * Compatibility method for the existing controller.
     * <p>
     * PUBLISHED = publish.
     * DRAFT = no-op because the working state is already DRAFT.
     */
    @Transactional
    public Content updateContentStatus(
            UUID contentId,
            PublishingStatus status,
            User author
    ) {
        return switch (status) {
            case PUBLISHED -> publishContent(contentId, author);

            case DRAFT -> getOrCreateDraft(contentId, author);

            case DELETED -> deleteContent(contentId, author);

            case ARCHIVED -> {
                Content published = getPublished(contentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Published content not found: "
                                                + contentId
                                )
                        );

                published.setStatus(PublishingStatus.ARCHIVED);
                published.setIsVisible(false);
                published.setAuthor(author);

                yield contentRepository.save(published);
            }
        };
    }

    /**
     * Create a DRAFT from the current PUBLISHED version
     * when no DRAFT exists.
     */
    private Content getOrCreateDraft(
            UUID contentId,
            User author
    ) {
        Optional<Content> existingDraft =
                getDraft(contentId);

        if (existingDraft.isPresent()) {
            return existingDraft.get();
        }

        Content published = getPublished(contentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Content not found: " + contentId
                        )
                );

        Content draft = Content.builder()
                .contentId(published.getContentId())
                .ownerId(published.getOwnerId())
                .version(published.getVersion() + 1)
                .title(published.getTitle())
                .body(published.getBody())
                .status(PublishingStatus.DRAFT)
                .isVisible(published.getIsVisible())
                .sortOrder(published.getSortOrder())
                .author(author)
                .medias(new ArrayList<>(published.getMedias()))
                .build();

        return contentRepository.save(draft);
    }

    /**
     * Synchronize media associations between DRAFT and PUBLISHED.
     */
    private void synchronizeMedias(
            Content published,
            Content draft
    ) {
        published.getMedias().clear();
        published.getMedias().addAll(
                new ArrayList<>(draft.getMedias())
        );
    }

    /**
     * Create default content body.
     */
    public JsonNode createDefaultBody() {
        try {
            return objectMapper.readTree(
                    "{\"html\": \"<p>Start writing your content here...</p>\"}"
            );
        } catch (Exception e) {
            log.error(
                    "Error creating default content body",
                    e
            );

            return objectMapper
                    .createObjectNode()
                    .put(
                            "html",
                            "<p>Start writing your content here...</p>"
                    );
        }
    }
}