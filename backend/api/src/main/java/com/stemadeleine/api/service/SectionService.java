package com.stemadeleine.api.service;

import com.stemadeleine.api.model.Page;
import com.stemadeleine.api.model.PublishingStatus;
import com.stemadeleine.api.model.Section;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.SectionRepository;
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
public class SectionService {

    private final SectionRepository sectionRepository;
    private final PageService pageService;

    public List<Section> getAllSections() {
        return sectionRepository.findAll();
    }

    public Optional<Section> getSectionById(UUID id) {
        return sectionRepository.findById(id);
    }

    public List<Section> getSectionsByPage(UUID pageId) {
        return sectionRepository.findLastVersionsByPageId(pageId);
    }

    public Optional<Section> getLastVersion(UUID sectionId) {
        return sectionRepository.findTopBySectionIdOrderByVersionDesc(sectionId);
    }

    public Section createNewSection(UUID pageId, String name, User author) {
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

        return sectionRepository.save(section);
    }

    public Section updateSection(UUID sectionId, String name, String title, Boolean isVisible, User author) {
        // D'abord essayer de trouver par sectionId (identifiant de version)
        Optional<Section> sectionOpt = sectionRepository.findTopBySectionIdOrderByVersionDesc(sectionId);

        // Si pas trouvé, essayer de trouver par id direct
        if (sectionOpt.isEmpty()) {
            sectionOpt = sectionRepository.findById(sectionId);
        }

        Section section = sectionOpt.orElseThrow(() -> new RuntimeException("Section not found with id: " + sectionId));

        if (name != null) section.setName(name);
        if (title != null) section.setTitle(title);
        if (isVisible != null) section.setIsVisible(isVisible);
        section.setAuthor(author);

        return sectionRepository.save(section);
    }

    @Transactional
    public void deleteSection(UUID sectionId) {
        Section section = sectionRepository.findTopBySectionIdOrderByVersionDesc(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found with sectionId: " + sectionId));

        sectionRepository.softDeleteById(section.getId());
    }
}
