package com.stemadeleine.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.repository.MediaRepository;
import com.stemadeleine.api.repository.SectionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SectionService {

    private final SectionRepository sectionRepository;
    private final PageService pageService;
    private final MediaRepository mediaRepository;
    private final ContentService contentService;

    @Autowired
    @Lazy
    private ModuleService moduleService;

    /**
     * Get all sections (DRAFT rows, backoffice)
     */
    public List<Section> getAllSections() {
        return sectionRepository.findByStatus(PublishingStatus.DRAFT);
    }

    /**
     * Get section by technical ID (DRAFT or PUBLISHED row)
     */
    public Optional<Section> getSectionById(UUID id) {
        return sectionRepository.findById(id)
                .filter(s -> s.getStatus() == PublishingStatus.DRAFT || s.getStatus() == PublishingStatus.PUBLISHED);
    }

    /**
     * DRAFT sections of a page identified by its logical pageId (backoffice)
     */
    public List<Section> getSectionsByPageId(UUID pageId) {
        return sectionRepository.findByPageIdAndStatus(pageId, PublishingStatus.DRAFT);
    }

    /**
     * DRAFT of a section (backoffice)
     */
    public Optional<Section> getLastVersion(UUID sectionId) {
        return sectionRepository.findBySectionIdAndStatus(sectionId, PublishingStatus.DRAFT);
    }

    /**
     * Create a new DRAFT section in the DRAFT page
     */
    @Transactional
    public Section createNewSection(UUID pageId, String name, User author) {
        Page parentPage = pageService.getLastVersion(pageId)
                .orElseThrow(() -> new RuntimeException("Page not found with id: " + pageId));

        Integer maxSortOrder = sectionRepository.findMaxSortOrderByPageRowIdAndStatus(parentPage.getId(), PublishingStatus.DRAFT);

        Section section = Section.builder()
                .sectionId(UUID.randomUUID())
                .page(parentPage)
                .version(1)
                .name(name)
                .title(name)
                .sortOrder((maxSortOrder != null ? maxSortOrder : 0) + 1)
                .author(author)
                .status(PublishingStatus.DRAFT)
                .isVisible(false)
                .build();

        return sectionRepository.save(section);
    }

    /**
     * Update the DRAFT section in place
     */
    @Transactional
    public Section updateSection(UUID sectionId, String name, String title, Boolean isVisible, User author) {
        Section section = getDraftOrThrow(sectionId);

        if (name != null) section.setName(name);
        if (title != null) section.setTitle(title);
        if (isVisible != null) section.setIsVisible(isVisible);
        if (author != null) section.setAuthor(author);

        return saveDraft(section);
    }

    /**
     * Add content to section
     */
    @Transactional
    public Content addContentToSection(UUID sectionId, String title, JsonNode body, User author) {
        log.info("Adding content '{}' to section: {} by user: {}", title, sectionId, author.getUsername());

        getDraftOrThrow(sectionId);

        return contentService.createContent(title, body, sectionId, author);
    }

    /**
     * Create new content with default values
     */
    @Transactional
    public Content createNewContent(UUID sectionId, String title, User author) {
        log.info("Creating new content '{}' for section {} by user: {}", title, sectionId, author.getUsername());

        JsonNode defaultBody = contentService.createDefaultBody();
        return addContentToSection(sectionId, title, defaultBody, author);
    }

    /**
     * Get contents for a section
     */
    public List<Content> getContentsBySection(UUID sectionId) {
        log.debug("Retrieving contents for section: {}", sectionId);

        List<Content> contents = contentService.getContentsByOwner(sectionId);

        log.debug("Found {} contents for section: {}", contents.size(), sectionId);

        return contents;
    }

    /**
     * Set media for section
     */
    @Transactional
    public Section setSectionMedia(UUID sectionId, UUID mediaId, User author) {
        Section section = getDraftOrThrow(sectionId);

        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new RuntimeException("Media not found: " + mediaId));

        media.setOwnerId(sectionId);
        mediaRepository.save(media);

        section.setMedia(media);
        section.setAuthor(author);
        return saveDraft(section);
    }

    /**
     * Remove media from section
     */
    @Transactional
    public Section removeSectionMedia(UUID sectionId, User author) {
        Section section = getDraftOrThrow(sectionId);

        Media media = section.getMedia();
        if (media != null) {
            media.setOwnerId(null);
            mediaRepository.save(media);
        }

        section.setMedia(null);
        section.setAuthor(author);
        return saveDraft(section);
    }

    /**
     * Delete section: DRAFT becomes DELETED, PUBLISHED becomes ARCHIVED (modules follow)
     */
    @Transactional
    public Section deleteSection(UUID sectionId, User author) {
        Section draft = getDraftOrThrow(sectionId);
        for (Section row : sectionRepository.findBySectionId(sectionId)) {
            softDeleteRow(row);
        }
        draft.setAuthor(author);
        return sectionRepository.save(draft);
    }

    /**
     * Logical deletion of all the sections (and their modules) attached to a page row
     */
    @Transactional
    public void softDeleteSectionsOfPage(Page pageRow) {
        sectionRepository.findByPageIdAndStatusOrderBySortOrderAsc(pageRow.getId(), pageRow.getStatus())
                .forEach(this::softDeleteRow);
    }

    private void softDeleteRow(Section row) {
        if (row.getStatus() != PublishingStatus.DRAFT && row.getStatus() != PublishingStatus.PUBLISHED) {
            return;
        }
        moduleService.softDeleteModulesOfSection(row);
        row.setStatus(row.getStatus() == PublishingStatus.DRAFT ? PublishingStatus.DELETED : PublishingStatus.ARCHIVED);
        row.setIsVisible(false);
        sectionRepository.save(row);
    }

    /**
     * Update section sort order (DRAFT)
     */
    @Transactional
    public void updateSectionSortOrder(UUID pageId, List<UUID> sectionIds, User author) {
        for (int i = 0; i < sectionIds.size(); i++) {
            Section section = getDraftOrThrow(sectionIds.get(i));
            if (!Integer.valueOf(i + 1).equals(section.getSortOrder())) {
                section.setSortOrder(i + 1);
                section.setAuthor(author);
                saveDraft(section);
            }
        }
    }

    /**
     * Updates the DRAFT section in place (no new row)
     */
    @Transactional
    public Section createSectionVersion(UUID sectionId, String name, String title, Boolean isVisible, User author) {
        return updateSection(sectionId, name, title, isVisible, author);
    }

    /**
     * Publish section: the PUBLISHED row is created or updated from the draft (same version),
     * and all the modules of the draft section are published with it. The page must be published.
     */
    @Transactional
    public Section publishSection(UUID sectionId, User author) {
        Section draft = getDraftOrThrow(sectionId);

        Page publishedPage = pageService.getPublishedPage(draft.getPage().getPageId())
                .orElseThrow(() -> new IllegalStateException(
                        "The page must be published before its sections: " + draft.getPage().getPageId()));

        Section published = sectionRepository.findBySectionIdAndStatus(sectionId, PublishingStatus.PUBLISHED)
                .orElseGet(() -> Section.builder()
                        .sectionId(sectionId)
                        .status(PublishingStatus.PUBLISHED)
                        .build());
        published.setPage(publishedPage);
        published.setVersion(draft.getVersion());
        published.setName(draft.getName());
        published.setTitle(draft.getTitle());
        published.setSortOrder(draft.getSortOrder());
        published.setIsVisible(draft.getIsVisible());
        published.setMedia(draft.getMedia());
        published.setAuthor(author != null ? author : draft.getAuthor());
        published = sectionRepository.save(published);

        for (Module module : moduleService.getModulesBySection(draft.getId())) {
            moduleService.publishModule(module.getModuleId(), author);
        }
        return published;
    }

    /**
     * Get published and visible sections by logical pageId for public access
     */
    public List<Section> getPublishedVisibleSectionsByPageId(UUID pageId) {
        Optional<Page> publishedPage = pageService.getPublishedPage(pageId)
                .or(() -> pageService.findByIdAndVisible(pageId, true));
        if (publishedPage.isEmpty()) {
            return List.of();
        }
        return sectionRepository
                .findByPageIdAndStatusOrderBySortOrderAsc(publishedPage.get().getId(), PublishingStatus.PUBLISHED)
                .stream()
                .filter(s -> Boolean.TRUE.equals(s.getIsVisible()))
                .toList();
    }

    private Section getDraftOrThrow(UUID sectionId) {
        return getLastVersion(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found: " + sectionId));
    }

    private Section saveDraft(Section section) {
        section.setStatus(PublishingStatus.DRAFT);
        section.setVersion(section.getVersion() + 1);
        return sectionRepository.save(section);
    }
}
