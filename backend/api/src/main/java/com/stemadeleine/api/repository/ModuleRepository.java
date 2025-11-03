package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.PublishingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ModuleRepository extends JpaRepository<Module, UUID> {
    List<Module> findBySectionIdAndStatusNot(UUID sectionId, PublishingStatus status);

    /**
     * Retrieves modules with their inherited class data for a specific section
     * This query ensures that subclass-specific fields are loaded (News, Gallery, Article, etc.)
     */
    @Query("SELECT m FROM Module m " +
            "LEFT JOIN FETCH m.section " +
            "WHERE m.section.id = :sectionId " +
            "AND m.status != :status " +
            "ORDER BY m.sortOrder ASC")
    List<Module> findBySectionIdAndStatusNotWithInheritedData(UUID sectionId, PublishingStatus status);

    @Query("SELECT COALESCE(MAX(m.sortOrder), 0) FROM Module m WHERE m.section.id = :sectionId")
    Short findMaxSortOrderBySection(UUID sectionId);

    Optional<Module> findTopByModuleIdOrderByVersionDesc(UUID moduleId);

    Optional<Module> findByModuleId(UUID moduleId);
}
