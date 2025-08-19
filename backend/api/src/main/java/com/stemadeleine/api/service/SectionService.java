package com.stemadeleine.api.service;

import com.stemadeleine.api.model.Section;
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

    public List<Section> getAllSections() {
        return sectionRepository.findAll();
    }

    public Optional<Section> getSectionById(UUID id) {
        return sectionRepository.findById(id);
    }

    public List<Section> getSectionsByPage(UUID pageId) {
        return sectionRepository.findByPageIdOrderBySortOrderAsc(pageId);
    }

    public Section createSection(Section section) {
        return sectionRepository.save(section);
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
        sectionRepository.deleteById(id);
    }
}
