package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.Section;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SectionRepository extends JpaRepository<Section, UUID> {
    List<Section> findByPageIdOrderBySortOrderAsc(UUID pageId);

    List<Section> findByIsVisibleTrue();
}