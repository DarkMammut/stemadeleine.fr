package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateContentRequest;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.repository.ContentRepository;
import com.stemadeleine.api.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ModuleService {
    private final ModuleRepository moduleRepository;
    private final SectionService sectionService;
    private final ContentRepository contentRepository;
    private final MediaGalleryService mediaAttachmentService;

    public List<Module> getAllModules() {
        log.debug("Retrieving all modules");
        List<Module> modules = moduleRepository.findAll();
        log.debug("Found {} modules", modules.size());
        return modules;
    }

    public List<Module> getModulesBySection(UUID sectionId) {
        log.debug("Retrieving modules for section: {}", sectionId);
        List<Module> modules = moduleRepository.findBySectionIdAndStatusNot(sectionId, PublishingStatus.DELETED);
        log.debug("Found {} modules for section: {}", modules.size(), sectionId);
        return modules;
    }

    /**
     * Retrieves published and visible modules by sectionId for public access
     * This method loads complete module data including inherited class-specific fields
     */
    public List<Module> getPublishedVisibleModulesBySectionId(UUID sectionId) {
        log.debug("Retrieving published and visible modules with inherited data for section: {}", sectionId);

        // First, get the section by sectionId to retrieve its internal id
        Section section = sectionService.getLastVersion(sectionId)
                .orElseThrow(() -> {
                    log.error("Section not found with sectionId: {}", sectionId);
                    return new RuntimeException("Section not found with sectionId: " + sectionId);
                });

        // Use the internal section id for the repository query
        List<Module> allModules = moduleRepository.findBySectionIdAndStatusNotWithInheritedData(section.getId(), PublishingStatus.DELETED);
        log.debug("Found {} total modules with inherited data for section: {}", allModules.size(), sectionId);

        List<Module> publishedVisibleModules = allModules.stream()
                .filter(module -> module.getStatus() == PublishingStatus.PUBLISHED)
                .filter(Module::getIsVisible)
                .toList();

        log.debug("Found {} published and visible modules for section: {}", publishedVisibleModules.size(), sectionId);
        return publishedVisibleModules;
    }

    public Optional<Module> getModuleById(UUID id) {
        log.debug("Retrieving module by id: {}", id);
        Optional<Module> module = moduleRepository.findById(id)
                .filter(module1 -> module1.getStatus() != PublishingStatus.DELETED);
        log.debug("Module found: {}", module.isPresent());
        return module;
    }

    public Optional<Module> getModuleByModuleId(UUID moduleId) {
        log.debug("Retrieving latest module version by moduleId: {}", moduleId);
        Optional<Module> module = moduleRepository.findTopByModuleIdOrderByVersionDesc(moduleId)
                .filter(module1 -> module1.getStatus() != PublishingStatus.DELETED);
        log.debug("Module found: {}", module.isPresent());
        return module;
    }

    public Optional<Module> updateModule(UUID moduleId, Module moduleDetails) {
        log.info("Updating module: {}", moduleId);
        Optional<Module> updatedModule = moduleRepository.findTopByModuleIdOrderByVersionDesc(moduleId)
                .filter(module -> module.getStatus() != PublishingStatus.DELETED)
                .map(module -> {
                    log.debug("Updating module details for moduleId: {}", moduleId);
                    module.setName(moduleDetails.getName());
                    module.setTitle(moduleDetails.getTitle());
                    module.setIsVisible(moduleDetails.getIsVisible());
                    module.setSortOrder(moduleDetails.getSortOrder());
                    if (moduleDetails.getStatus() != null) {
                        module.setStatus(moduleDetails.getStatus());
                    }
                    Module saved = moduleRepository.save(module);
                    log.debug("Module updated successfully: {}", moduleId);
                    return saved;
                });
        if (updatedModule.isEmpty()) {
            log.warn("Module not found for update: {}", moduleId);
        }
        return updatedModule;
    }

    public void softDeleteModule(UUID moduleId) {
        log.info("Soft deleting module: {}", moduleId);
        moduleRepository.findTopByModuleIdOrderByVersionDesc(moduleId).ifPresentOrElse(module -> {
            module.setStatus(PublishingStatus.DELETED);
            moduleRepository.save(module);
            log.info("Module soft deleted successfully: {}", moduleId);
        }, () -> log.warn("Module not found for soft deletion: {}", moduleId));
    }

    public Optional<Module> updateSortOrder(UUID id, Integer sortOrder) {
        log.debug("Updating sort order for module: {} to {}", id, sortOrder);
        Optional<Module> updatedModule = moduleRepository.findById(id)
                .filter(module -> module.getStatus() != PublishingStatus.DELETED)
                .map(module -> {
                    module.setSortOrder(sortOrder);
                    Module saved = moduleRepository.save(module);
                    log.debug("Sort order updated successfully for module: {}", id);
                    return saved;
                });
        if (updatedModule.isEmpty()) {
            log.warn("Module not found for sort order update: {}", id);
        }
        return updatedModule;
    }

    public Optional<Module> updateVisibility(UUID moduleId, Boolean isVisible) {
        log.info("Updating visibility for module: {} to {}", moduleId, isVisible);
        Optional<Module> updatedModule = moduleRepository.findTopByModuleIdOrderByVersionDesc(moduleId)
                .filter(module -> module.getStatus() != PublishingStatus.DELETED)
                .map(module -> {
                    module.setIsVisible(isVisible);
                    Module saved = moduleRepository.save(module);
                    log.debug("Visibility updated successfully for module: {}", moduleId);
                    return saved;
                });
        if (updatedModule.isEmpty()) {
            log.warn("Module not found for visibility update: {}", moduleId);
        }
        return updatedModule;
    }

    public List<Content> getContentsByModuleId(UUID moduleId) {
        log.debug("Retrieving contents for module: {}", moduleId);
        List<Content> contents = contentRepository.findByOwnerIdOrderBySortOrderAsc(moduleId);
        log.debug("Found {} contents for module: {}", contents.size(), moduleId);
        return contents;
    }

    public Content createContentForModule(UUID moduleId, CreateContentRequest request, User author) {
        log.info("Creating content for module: {}", moduleId);

        // Check that the module exists
        Module module = moduleRepository.findTopByModuleIdOrderByVersionDesc(moduleId)
                .orElseThrow(() -> {
                    log.error("Module not found with id: {}", moduleId);
                    return new RuntimeException("Module not found with id: " + moduleId);
                });

        log.debug("Creating content with title: {} for module: {}", request.getTitle(), moduleId);
        Content content = Content.builder()
                .contentId(UUID.randomUUID())
                .ownerId(moduleId)
                .version(1)
                .status(PublishingStatus.DRAFT)
                .title(request.getTitle())
                .body(request.getBody())
                .sortOrder(request.getSortOrder())
                .isVisible(request.getIsVisible() != null ? request.getIsVisible() : true)
                .author(author)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        Content savedContent = contentRepository.save(content);
        log.info("Content created successfully with id: {} for module: {}", savedContent.getId(), moduleId);
        return savedContent;
    }

    public List<Media> getMediasByModuleId(UUID moduleId) {
        log.debug("Retrieving media for module: {}", moduleId);
        List<Media> medias = mediaAttachmentService.getMediasByOwnerId(moduleId);
        log.debug("Found {} media files for module: {}", medias.size(), moduleId);
        return medias;
    }

    public Media attachMediaToModule(UUID moduleId, UUID mediaId, User user) {
        log.info("Attaching media: {} to module: {}", mediaId, moduleId);
        Media attachedMedia = mediaAttachmentService.attachMediaToOwner(moduleId, mediaId, user);
        log.info("Media attached successfully: {} to module: {}", mediaId, moduleId);
        return attachedMedia;
    }

    public void detachMediaFromModule(UUID moduleId, UUID mediaId) {
        log.info("Detaching media: {} from module: {}", mediaId, moduleId);
        mediaAttachmentService.detachMediaFromOwner(moduleId, mediaId);
        log.info("Media detached successfully: {} from module: {}", mediaId, moduleId);
    }

    public List<Module> saveAll(List<Module> modules) {
        log.debug("Saving {} modules in batch", modules.size());
        List<Module> savedModules = moduleRepository.saveAll(modules);
        log.debug("Successfully saved {} modules in batch", savedModules.size());
        return savedModules;
    }

    public Module publishModule(UUID moduleId, User author) {
        log.info("Publishing module: {}", moduleId);
        Module module = moduleRepository.findTopByModuleIdOrderByVersionDesc(moduleId)
                .orElseThrow(() -> {
                    log.error("Module not found for publishing: {}", moduleId);
                    return new RuntimeException("Module not found: " + moduleId);
                });

        module.setStatus(PublishingStatus.PUBLISHED);
        module.setAuthor(author);
        module.setUpdatedAt(OffsetDateTime.now());

        // Publish contents if the module has any
        List<Content> contents = getContentsByModuleId(moduleId);
        if (contents != null && !contents.isEmpty()) {
            log.debug("Publishing {} contents for module: {}", contents.size(), moduleId);
            for (Content content : contents) {
                content.setStatus(PublishingStatus.PUBLISHED);
                content.setAuthor(author);
                content.setUpdatedAt(OffsetDateTime.now());
                contentRepository.save(content);
            }
            log.debug("All contents published for module: {}", moduleId);
        }

        Module publishedModule = moduleRepository.save(module);
        log.info("Module published successfully: {}", moduleId);
        return publishedModule;
    }
}
