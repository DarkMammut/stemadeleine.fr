package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateContentRequest;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.repository.ContentRepository;
import com.stemadeleine.api.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ModuleService {
    private final ModuleRepository moduleRepository;
    private final SectionService sectionService;
    private final ContentRepository contentRepository;
    private final MediaGalleryService mediaAttachmentService;

    public List<Module> getAllModules() {
        return moduleRepository.findAll();
    }

    public List<Module> getModulesBySection(UUID sectionId) {
        return moduleRepository.findBySectionIdAndStatusNot(sectionId, PublishingStatus.DELETED);
    }

    public Optional<Module> getModuleById(UUID id) {
        return moduleRepository.findById(id)
                .filter(module -> module.getStatus() != PublishingStatus.DELETED);
    }

    public Optional<Module> getModuleByModuleId(UUID moduleId) {
        return moduleRepository.findTopByModuleIdOrderByVersionDesc(moduleId)
                .filter(module -> module.getStatus() != PublishingStatus.DELETED);
    }

    public Optional<Module> updateModule(UUID moduleId, Module moduleDetails) {
        return moduleRepository.findTopByModuleIdOrderByVersionDesc(moduleId)
                .filter(module -> module.getStatus() != PublishingStatus.DELETED)
                .map(module -> {
                    module.setName(moduleDetails.getName());
                    module.setTitle(moduleDetails.getTitle());
                    module.setIsVisible(moduleDetails.getIsVisible());
                    module.setSortOrder(moduleDetails.getSortOrder());
                    if (moduleDetails.getStatus() != null) {
                        module.setStatus(moduleDetails.getStatus());
                    }
                    return moduleRepository.save(module);
                });
    }

    public void softDeleteModule(UUID moduleId) {
        moduleRepository.findTopByModuleIdOrderByVersionDesc(moduleId).ifPresent(module -> {
            module.setStatus(PublishingStatus.DELETED);
            moduleRepository.save(module);
        });
    }

    public Optional<Module> updateSortOrder(UUID id, Integer sortOrder) {
        return moduleRepository.findById(id)
                .filter(module -> module.getStatus() != PublishingStatus.DELETED)
                .map(module -> {
                    module.setSortOrder(sortOrder);
                    return moduleRepository.save(module);
                });
    }

    public Optional<Module> updateVisibility(UUID moduleId, Boolean isVisible) {
        return moduleRepository.findTopByModuleIdOrderByVersionDesc(moduleId)
                .filter(module -> module.getStatus() != PublishingStatus.DELETED)
                .map(module -> {
                    module.setIsVisible(isVisible);
                    return moduleRepository.save(module);
                });
    }

    public List<Content> getContentsByModuleId(UUID moduleId) {
        return contentRepository.findByOwnerIdOrderBySortOrderAsc(moduleId);
    }

    public Content createContentForModule(UUID moduleId, CreateContentRequest request, User author) {
        // Vérifier que le module existe
        Module module = moduleRepository.findTopByModuleIdOrderByVersionDesc(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found with id: " + moduleId));

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
        return contentRepository.save(content);
    }

    public List<Media> getMediasByModuleId(UUID moduleId) {
        return mediaAttachmentService.getMediasByOwnerId(moduleId);
    }

    public Media attachMediaToModule(UUID moduleId, UUID mediaId, User user) {
        return mediaAttachmentService.attachMediaToOwner(moduleId, mediaId, user);
    }

    public void detachMediaFromModule(UUID moduleId, UUID mediaId) {
        mediaAttachmentService.detachMediaFromOwner(moduleId, mediaId);
    }

    public List<Module> saveAll(List<Module> modules) {
        return moduleRepository.saveAll(modules);
    }

    public Module publishModule(UUID moduleId, User author) {
        Module module = moduleRepository.findTopByModuleIdOrderByVersionDesc(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found: " + moduleId));
        module.setStatus(PublishingStatus.PUBLISHED);
        module.setAuthor(author);
        module.setUpdatedAt(OffsetDateTime.now());
        // Publier les contenus si le module en possède
        List<Content> contents = getContentsByModuleId(moduleId);
        if (contents != null && !contents.isEmpty()) {
            for (Content content : contents) {
                content.setStatus(PublishingStatus.PUBLISHED);
                content.setAuthor(author);
                content.setUpdatedAt(OffsetDateTime.now());
                contentRepository.save(content);
            }
        }
        return moduleRepository.save(module);
    }
}
