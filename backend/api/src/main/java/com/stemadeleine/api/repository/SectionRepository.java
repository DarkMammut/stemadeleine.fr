package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.PublishingStatus;
import com.stemadeleine.api.model.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SectionRepository extends JpaRepository<Section, UUID> {

    @Query("""
            SELECT s
            FROM Section s
            LEFT JOIN FETCH s.media
            WHERE s.sectionId = :sectionId
              AND s.status = :status
            """)
    Optional<Section> findBySectionIdAndStatus(
            @Param("sectionId") UUID sectionId,
            @Param("status") PublishingStatus status
    );

    List<Section> findBySectionId(UUID sectionId);

    List<Section> findByStatus(PublishingStatus status);

    /**
     * Sections of a logical page (pageId) in a given status.
     */
    @Query("""
            SELECT s
            FROM Section s
            LEFT JOIN FETCH s.media
            WHERE s.page.pageId = :pageId
              AND s.status = :status
            ORDER BY s.sortOrder ASC
            """)
    List<Section> findByPageIdAndStatus(
            @Param("pageId") UUID pageId,
            @Param("status") PublishingStatus status
    );

    /**
     * Sections attached to a given page row (technical id) in a given status.
     */
    List<Section> findByPageIdAndStatusOrderBySortOrderAsc(UUID pageRowId, PublishingStatus status);

    @Query("""
            SELECT MAX(s.sortOrder)
            FROM Section s
            WHERE s.page.id = :pageRowId
              AND s.status = :status
            """)
    Integer findMaxSortOrderByPageRowIdAndStatus(
            @Param("pageRowId") UUID pageRowId,
            @Param("status") PublishingStatus status
    );
}
