package com.stemadeleine.api.service;

import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.PublishingStatus;
import com.stemadeleine.api.model.Section;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ModuleService {
    private final ModuleRepository moduleRepository;
    private final SectionService sectionService;

    public List<Module> getAllModules() {
        return moduleRepository.findAll();
    }

    public Module createNewModule(UUID sectionId, String name, String type, User author) {
        // D'abord essayer de trouver par sectionId (identifiant de version)
        Optional<Section> sectionOpt = sectionService.getLastVersion(sectionId);

        // Si pas trouvé, essayer de trouver par id direct
        if (sectionOpt.isEmpty()) {
            sectionOpt = sectionService.getSectionById(sectionId);
        }

        Section section = sectionOpt.orElseThrow(() -> new RuntimeException("Section not found with id: " + sectionId));

        Short maxSortOrder = moduleRepository.findMaxSortOrderBySection(section.getId());
        if (maxSortOrder == null) maxSortOrder = 0;

        Module module = Module.builder()
                .section(section)
                .name(name)
                .title(name)
                .type(type)
                .sortOrder(maxSortOrder + 1)
                .author(author)
                .status(PublishingStatus.DRAFT)
                .isVisible(false)
                .version(1)
                .moduleId(UUID.randomUUID())
                .build();

        return moduleRepository.save(module);
    }

    public List<Module> getModulesBySection(UUID sectionId) {
        return moduleRepository.findBySectionIdAndStatusNot(sectionId, PublishingStatus.DELETED);
    }

    public Optional<Module> getModuleById(UUID id) {
        return moduleRepository.findById(id)
                .filter(module -> module.getStatus() != PublishingStatus.DELETED);
    }

    public Optional<Module> updateModule(UUID id, Module moduleDetails) {
        return moduleRepository.findById(id)
                .filter(module -> module.getStatus() != PublishingStatus.DELETED)
                .map(module -> {
                    module.setName(moduleDetails.getName());
                    module.setTitle(moduleDetails.getTitle());
                    module.setIsVisible(moduleDetails.getIsVisible());
                    module.setSortOrder(moduleDetails.getSortOrder());
                    return moduleRepository.save(module);
                });
    }

    public void softDeleteModule(UUID id) {
        moduleRepository.findById(id).ifPresent(module -> {
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

    public Optional<Module> updateVisibility(UUID id, Boolean isVisible) {
        return moduleRepository.findById(id)
                .filter(module -> module.getStatus() != PublishingStatus.DELETED)
                .map(module -> {
                    module.setIsVisible(isVisible);
                    return moduleRepository.save(module);
                });
    }
}
