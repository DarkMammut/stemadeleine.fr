package com.stemadeleine.api.service;

import com.stemadeleine.api.model.Page;
import com.stemadeleine.api.model.PublishingStatus;
import com.stemadeleine.api.model.Section;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.SectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

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

    public Section createSection(Section section) {
        return sectionRepository.save(section);
    }

    public Section createNewSection(UUID pageId, String name, User author) {
        Page page = pageService.getLastVersion(pageId)
                .orElseThrow(() -> new RuntimeException("Page not found with id: " + pageId));

        Short maxSortOrder = sectionRepository.findMaxSortOrderByPage(page.getId());
        if (maxSortOrder == null) maxSortOrder = 0;

        Section section = Section.builder()
                .sectionId(UUID.randomUUID())
                .page(page)
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

    public Section createNewVersion(UUID sectionId, User author) {
        Section latest = sectionRepository.findTopBySectionIdOrderByVersionDesc(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));

        Section newVersion = Section.builder()
                .sectionId(latest.getSectionId())
                .page(latest.getPage())
                .version(latest.getVersion() + 1)
                .name(latest.getName())
                .title(latest.getTitle())
                .sortOrder(latest.getSortOrder())
                .author(author)
                .status(PublishingStatus.DRAFT)
                .isVisible(latest.getIsVisible())
                .build();

        return sectionRepository.save(newVersion);
    }

    public Section updateSection(UUID id, Section sectionDetails) {
        return sectionRepository.findById(id)
                .map(section -> {
                    section.setTitle(sectionDetails.getTitle());
                    section.setSortOrder(sectionDetails.getSortOrder());
                    section.setIsVisible(sectionDetails.getIsVisible());
                    section.setPage(sectionDetails.getPage());
                    section.setUpdatedAt(sectionDetails.getUpdatedAt());
                    return sectionRepository.save(section);
                })
                .orElseThrow(() -> new RuntimeException("Section not found"));
    }


    public void deleteSection(UUID id) {
        sectionRepository.softDeleteById(id);
    }
}
