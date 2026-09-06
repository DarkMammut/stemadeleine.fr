package com.stemadeleine.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stemadeleine.api.model.List;
import com.stemadeleine.api.model.ListContent;
import com.stemadeleine.api.model.Media;
import com.stemadeleine.api.repository.ListContentRepository;
import com.stemadeleine.api.repository.ListRepository;
import com.stemadeleine.api.repository.MediaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ListContentService {

    private final ListContentRepository listContentRepository;
    private final ListRepository listRepository;
    private final MediaRepository mediaRepository;
    private final ObjectMapper objectMapper;

    /**
     * Get all contents for a given list (ordered by sortOrder)
     */
    public java.util.List<ListContent> getContentsByListId(UUID listId) {
        log.debug("Retrieving contents for list: {}", listId);
        return listRepository.findById(listId)
                .map(List::getContents)
                .orElse(java.util.Collections.emptyList());
    }

    public Optional<ListContent> getById(UUID id) {
        return listContentRepository.findById(id);
    }

    /**
     * Add a new content item to a list
     */
    @Transactional
    public ListContent addContent(UUID listId, String title) {
        log.info("Adding content '{}' to list: {}", title, listId);

        List list = listRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("List not found: " + listId));

        int nextSortOrder = list.getContents() != null ? list.getContents().size() : 0;

        ListContent content = ListContent.builder()
                .list(list)
                .contentId(UUID.randomUUID())
                .title(title)
                .body(createDefaultBody())
                .isVisible(true)
                .sortOrder(nextSortOrder)
                .build();

        ListContent savedContent = listContentRepository.save(content);
        log.debug("Content added with ID: {}", savedContent.getId());
        return savedContent;
    }

    /**
     * Update title, body and/or link URL of a content item
     */
    @Transactional
    public ListContent updateContent(UUID id, String title, JsonNode body, String linkUrl) {
        log.info("Updating list content: {}", id);

        ListContent content = listContentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("List content not found: " + id));

        if (title != null) {
            content.setTitle(title);
        }
        if (body != null) {
            content.setBody(body);
        }
        content.setLinkUrl(linkUrl);

        ListContent savedContent = listContentRepository.save(content);
        log.debug("List content updated: {}", savedContent.getId());
        return savedContent;
    }

    /**
     * Update visibility of a content item
     */
    @Transactional
    public ListContent updateVisibility(UUID id, Boolean isVisible) {
        log.info("Updating visibility of list content: {} to {}", id, isVisible);

        ListContent content = listContentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("List content not found: " + id));

        content.setIsVisible(isVisible);

        ListContent savedContent = listContentRepository.save(content);
        log.debug("List content visibility updated: {}", savedContent.getId());
        return savedContent;
    }

    /**
     * Delete a content item
     */
    @Transactional
    public void deleteContent(UUID id) {
        log.info("Deleting list content: {}", id);
        if (!listContentRepository.existsById(id)) {
            throw new RuntimeException("List content not found: " + id);
        }
        listContentRepository.deleteById(id);
        log.debug("List content deleted: {}", id);
    }

    /**
     * Attach a media to a list content item
     */
    @Transactional
    public Media attachMedia(UUID contentId, UUID mediaId) {
        log.info("Attaching media {} to list content: {}", mediaId, contentId);
        ListContent content = listContentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("List content not found: " + contentId));
        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new RuntimeException("Media not found with id: " + mediaId));

        java.util.List<Media> medias = content.getMedias();
        if (medias == null) {
            medias = new ArrayList<>();
        }
        if (medias.stream().noneMatch(m -> m.getId().equals(mediaId))) {
            medias.add(media);
            content.setMedias(medias);
            listContentRepository.save(content);
        }
        return media;
    }

    /**
     * Detach a media from a list content item
     */
    @Transactional
    public void detachMedia(UUID contentId, UUID mediaId) {
        log.info("Detaching media {} from list content: {}", mediaId, contentId);
        ListContent content = listContentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("List content not found: " + contentId));

        java.util.List<Media> medias = content.getMedias();
        if (medias != null && medias.removeIf(m -> m.getId().equals(mediaId))) {
            content.setMedias(medias);
            listContentRepository.save(content);
        }
    }

    private JsonNode createDefaultBody() {
        try {
            return objectMapper.readTree("{\"html\": \"<p>Commencez à écrire...</p>\"}");
        } catch (Exception e) {
            log.error("Error creating default list content body", e);
            return objectMapper.createObjectNode().put("html", "<p>Commencez à écrire...</p>");
        }
    }
}
