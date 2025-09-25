package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SectionRepository extends JpaRepository<Section, UUID> {

    List<Section> findByIsVisibleTrue();

    @Query("SELECT MAX(s.sortOrder) FROM Section s WHERE s.page.id = :pageId")
    Integer findMaxSortOrderByPage(@Param("pageId") UUID pageId);

    @Query("""
            SELECT DISTINCT s
            FROM Section s
            LEFT JOIN FETCH s.contents c
            WHERE s.sectionId = :sectionId
              AND s.version = (
                SELECT MAX(s2.version)
                FROM Section s2
                WHERE s2.sectionId = :sectionId
              )
            """)
    Optional<Section> findTopBySectionIdOrderByVersionDesc(@Param("sectionId") UUID sectionId);

    @Query("""
                SELECT s
                FROM Section s
                WHERE s.page.id = :pageId
                  AND s.version = (
                    SELECT MAX(s2.version)
                    FROM Section s2
                    WHERE s2.sectionId = s.sectionId
                  )
                ORDER BY s.sortOrder ASC
            """)
    List<Section> findLastVersionsByPageId(@Param("pageId") UUID pageId);

    @Query("SELECT s FROM Section s WHERE s.page.id = :pageId ORDER BY s.sortOrder ASC")
    List<Section> findByPageId(@Param("pageId") UUID pageId);
}