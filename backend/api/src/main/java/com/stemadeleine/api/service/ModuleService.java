package com.stemadeleine.api.service;

import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.PublishingStatus;
import com.stemadeleine.api.model.Section;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
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
        Section section = sectionService.getLastVersion(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));

        Short maxSortOrder = moduleRepository.findMaxSortOrderBySection(section.getId());
        if (maxSortOrder == null) maxSortOrder = 0;

        Module module = Module.builder()
                .section(section)
                .name(name)
                .type(type)
                .sortOrder(maxSortOrder + 1)
                .author(author)
                .status(PublishingStatus.DRAFT)
                .isVisible(false)
                .version(1)
                .moduleID(UUID.randomUUID())
                .build();

        return moduleRepository.save(module);
    }
}
