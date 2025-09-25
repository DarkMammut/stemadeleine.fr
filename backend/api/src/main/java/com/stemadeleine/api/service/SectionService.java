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
     * Get all sections
     */
    public List<Section> getAllSections() {
        log.debug("Retrieving all sections");
        return sectionRepository.findAll();
    }

    /**
     * Get section by ID
     */
    public Optional<Section> getSectionById(UUID id) {
        log.debug("Retrieving section by ID: {}", id);
        return sectionRepository.findById(id);
    }

    /**
     * Get sections by page ID
     */
    public List<Section> getSectionsByPageId(UUID pageId) {
        // Récupérer la dernière version de la page métier
        Optional<Page> lastPageOpt = pageService.getLastVersion(pageId);
        if (lastPageOpt.isEmpty()) {
            log.warn("No page found for business pageId: {}", pageId);
            return List.of();
        }
        Page lastPage = lastPageOpt.get();
        // Utiliser l'id technique pour récupérer les sections
        List<Section> sections = sectionRepository.findLastVersionsByPageId(lastPage.getId());
        log.info("Sections retrieved for business pageId {} (technical id {}): {}", pageId, lastPage.getId(), sections.stream().map(s -> String.format("[id=%s, name=%s, status=%s, pageId=%s]", s.getId(), s.getName(), s.getStatus(), s.getPage().getId())).toList());
        return sections;
    }

    /**
     * Get last version of a section by sectionId
     */
    public Optional<Section> getLastVersion(UUID sectionId) {
        log.debug("Retrieving last version of section: {}", sectionId);
        return sectionRepository.findTopBySectionIdOrderByVersionDesc(sectionId);
    }

    /**
     * Create a new section
     */
    public Section createNewSection(UUID pageId, String name, User author) {
        log.info("Creating new section '{}' for page {}", name, pageId);

        Page parentPage = pageService.getLastVersion(pageId)
                .orElseThrow(() -> new RuntimeException("Page not found with id: " + pageId));

        Integer maxSortOrder = sectionRepository.findMaxSortOrderByPage(parentPage.getId());
        if (maxSortOrder == null) {
            maxSortOrder = 0;
        }

        Section section = Section.builder()
                .sectionId(UUID.randomUUID())
                .page(parentPage)
                .version(1)
                .name(name)
                .title(name)
                .sortOrder(maxSortOrder + 1)
                .author(author)
                .status(PublishingStatus.DRAFT)
                .isVisible(false)
                .build();

        Section savedSection = sectionRepository.save(section);
        log.debug("Section created successfully with ID: {}", savedSection.getId());
        return savedSection;
    }

    /**
     * Update section basic information
     */
    @Transactional
    public Section updateSection(UUID sectionId, String name, String title, Boolean isVisible, User author) {
        log.info("Updating section {} by user: {} (in-place update)", sectionId, author.getUsername());

        Section currentSection = getLastVersion(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found: " + sectionId));

        if (name != null) currentSection.setName(name);
        if (title != null) currentSection.setTitle(title);
        if (isVisible != null) currentSection.setIsVisible(isVisible);
        if (author != null) currentSection.setAuthor(author);

        Section savedSection = sectionRepository.save(currentSection);
        log.debug("Section updated in-place: version {} for sectionId: {}",
                savedSection.getVersion(), savedSection.getSectionId());
        return savedSection;
    }

    /**
     * Add content to section
     */
    @Transactional
    public Content addContentToSection(UUID sectionId, String title, JsonNode body, User author) {
        log.info("Adding content '{}' to section: {} by user: {}", title, sectionId, author.getUsername());

        Section section = getLastVersion(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found: " + sectionId));

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
        return contentService.getLatestContentsByOwner(sectionId);
    }

    /**
     * Set media for section
     */
    @Transactional
    public Section setSectionMedia(UUID sectionId, UUID mediaId, User author) {
        log.info("Setting media {} for section {} by user: {}", mediaId, sectionId, author.getUsername());

        Section currentSection = getLastVersion(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found: " + sectionId));

        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new RuntimeException("Media not found: " + mediaId));

        // Met à jour le ownerId du média
        media.setOwnerId(sectionId);
        mediaRepository.save(media);

        Section updatedSection = Section.builder()
                .sectionId(sectionId)
                .page(currentSection.getPage())
                .version(currentSection.getVersion() + 1)
                .name(currentSection.getName())
                .title(currentSection.getTitle())
                .sortOrder(currentSection.getSortOrder())
                .author(author)
                .status(PublishingStatus.DRAFT)
                .isVisible(currentSection.getIsVisible())
                .media(media)
                .build();

        Section savedSection = sectionRepository.save(updatedSection);
        log.debug("Media set for section: version {} for sectionId: {}",
                savedSection.getVersion(), savedSection.getSectionId());
        return savedSection;
    }

    /**
     * Remove media from section
     */
    @Transactional
    public Section removeSectionMedia(UUID sectionId, User author) {
        log.info("Removing media from section {} by user: {}", sectionId, author.getUsername());

        Section currentSection = getLastVersion(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found: " + sectionId));

        Media media = currentSection.getMedia();
        if (media != null) {
            media.setOwnerId(null);
            mediaRepository.save(media);
        }

        Section updatedSection = Section.builder()
                .sectionId(sectionId)
                .page(currentSection.getPage())
                .version(currentSection.getVersion() + 1)
                .name(currentSection.getName())
                .title(currentSection.getTitle())
                .sortOrder(currentSection.getSortOrder())
                .author(author)
                .status(PublishingStatus.DRAFT)
                .isVisible(currentSection.getIsVisible())
                .media(null)
                .build();

        Section savedSection = sectionRepository.save(updatedSection);
        log.debug("Media removed for section: {}", sectionId);
        return savedSection;
    }

    /**
     * Delete section (mark as deleted)
     */
    @Transactional
    public Section deleteSection(UUID sectionId, User author) {
        log.info("Deleting section {} by user: {}", sectionId, author.getUsername());

        Section currentSection = getLastVersion(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found: " + sectionId));

        Section deletedSection = Section.builder()
                .sectionId(sectionId)
                .page(currentSection.getPage())
                .version(currentSection.getVersion() + 1)
                .name(currentSection.getName())
                .title(currentSection.getTitle())
                .sortOrder(currentSection.getSortOrder())
                .author(author)
                .status(PublishingStatus.DELETED)
                .isVisible(false)
                .media(currentSection.getMedia())
                .build();

        Section savedSection = sectionRepository.save(deletedSection);
        log.debug("Section marked as deleted: version {} for sectionId: {}",
                savedSection.getVersion(), savedSection.getSectionId());
        return savedSection;
    }

    /**
     * Update section sort order
     */
    @Transactional
    public void updateSectionSortOrder(UUID pageId, List<UUID> sectionIds, User author) {
        log.info("Updating section sort order for page {} by user: {}", pageId, author.getUsername());

        for (int i = 0; i < sectionIds.size(); i++) {
            UUID sectionId = sectionIds.get(i);
            Section currentSection = getLastVersion(sectionId)
                    .orElseThrow(() -> new RuntimeException("Section not found: " + sectionId));

            if (!currentSection.getSortOrder().equals(i + 1)) {
                Section updatedSection = Section.builder()
                        .sectionId(sectionId)
                        .page(currentSection.getPage())
                        .version(currentSection.getVersion() + 1)
                        .name(currentSection.getName())
                        .title(currentSection.getTitle())
                        .sortOrder(i + 1)
                        .author(author)
                        .status(currentSection.getStatus())
                        .isVisible(currentSection.getIsVisible())
                        .media(currentSection.getMedia())
                        .build();

                sectionRepository.save(updatedSection);
                log.debug("Section sort order updated: sectionId {} to position {}", sectionId, i + 1);
            }
        }
    }

    /**
     * Create section version
     */
    @Transactional
    public Section createSectionVersion(UUID sectionId, String name, String title, Boolean isVisible, User author) {
        // Récupérer la dernière version de la section
        Section currentSection = getLastVersion(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found: " + sectionId));

        // Créer la nouvelle version de la section
        Section newSection = Section.builder()
                .sectionId(sectionId)
                .page(currentSection.getPage())
                .version(currentSection.getVersion() + 1)
                .name(name != null ? name : currentSection.getName())
                .title(title != null ? title : currentSection.getTitle())
                .sortOrder(currentSection.getSortOrder())
                .author(author)
                .status(PublishingStatus.DRAFT)
                .isVisible(isVisible != null ? isVisible : currentSection.getIsVisible())
                .media(currentSection.getMedia())
                .build();

        // Correction : déclaration de clonedModules avant le if
        List<Module> clonedModules = new ArrayList<>();
        if (currentSection.getModules() != null) {
            for (Module module : currentSection.getModules()) {
                module.setSection(newSection);
                clonedModules.add(module);
            }
            newSection.setModules(clonedModules);
        }

        Section savedSection = sectionRepository.save(newSection);
        // Sauvegarder les modules pour mettre à jour la relation section
        if (!clonedModules.isEmpty()) {
            moduleService.saveAll(clonedModules);
        }
        log.debug("Section version created and modules attached: version {} for sectionId: {}", savedSection.getVersion(), savedSection.getSectionId());
        return savedSection;
    }

    /**
     * Save all sections
     */
    public List<Section> saveAll(List<Section> sections) {
        return sectionRepository.saveAll(sections);
    }

    /**
     * Publish section
     */
    @Transactional
    public Section publishSection(UUID sectionId, User author) {
        Section section = getLastVersion(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found: " + sectionId));
        section.setStatus(PublishingStatus.PUBLISHED);
        section.setAuthor(author);
        section.setUpdatedAt(java.time.OffsetDateTime.now());
        // Publier les modules si besoin
        if (section.getModules() != null) {
            for (Module module : section.getModules()) {
                module.setStatus(PublishingStatus.PUBLISHED);
                module.setAuthor(author);
                module.setUpdatedAt(java.time.OffsetDateTime.now());
            }
        }
        return sectionRepository.save(section);
    }
}
