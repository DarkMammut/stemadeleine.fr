package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.PublishingStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ModuleRepository extends JpaRepository<Module, UUID> {

    Optional<Module> findByModuleIdAndStatus(UUID moduleId, PublishingStatus status);

    List<Module> findByModuleId(UUID moduleId);

    boolean existsByModuleId(UUID moduleId);

    /**
     * Modules of a section given either its logical sectionId or the technical id of one of its rows.
     * The section row must have the requested status.
     */
    @Query("""
            SELECT m
            FROM Module m
            WHERE m.status = :status
              AND m.section.status = :status
              AND (m.section.sectionId = :sectionId OR m.section.id = :sectionId)
            ORDER BY m.sortOrder ASC
            """)
    List<Module> findBySectionAndStatus(
            @Param("sectionId") UUID sectionId,
            @Param("status") PublishingStatus status
    );

    /**
     * Modules attached to a given section row (technical id).
     */
    @Query("""
            SELECT m
            FROM Module m
            WHERE m.section.id = :sectionRowId
              AND m.status = :status
            ORDER BY m.sortOrder ASC
            """)
    List<Module> findBySectionRowIdAndStatus(
            @Param("sectionRowId") UUID sectionRowId,
            @Param("status") PublishingStatus status
    );

    @Query("""
            SELECT m
            FROM Module m
            WHERE m.status = :status
              AND (LOWER(m.name) LIKE CONCAT('%', :q, '%')
                OR LOWER(m.type) LIKE CONCAT('%', :q, '%'))
            """)
    List<Module> search(
            @Param("q") String q,
            @Param("status") PublishingStatus status,
            Pageable pageable
    );

    @Query("""
            SELECT COUNT(d)
            FROM Module d
            WHERE d.section.sectionId IN :sectionIds
              AND d.status = com.stemadeleine.api.model.PublishingStatus.DRAFT
              AND NOT EXISTS (
                  SELECT 1 FROM Module p
                  WHERE p.moduleId = d.moduleId
                    AND p.status = com.stemadeleine.api.model.PublishingStatus.PUBLISHED
                    AND p.version = d.version)
            """)
    long countUnpublishedDrafts(@Param("sectionIds") java.util.Collection<UUID> sectionIds);

    @Query("""
            SELECT d.moduleId
            FROM Module d
            WHERE d.section.sectionId IN :sectionIds
              AND d.status = com.stemadeleine.api.model.PublishingStatus.DRAFT
            """)
    List<UUID> findDraftModuleIdsBySectionIds(@Param("sectionIds") java.util.Collection<UUID> sectionIds);
}
