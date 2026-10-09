package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.Page;
import com.stemadeleine.api.model.PublishingStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PageRepository extends JpaRepository<Page, UUID> {

    Optional<Page> findByPageIdAndStatus(UUID pageId, PublishingStatus status);

    List<Page> findByPageId(UUID pageId);

    List<Page> findByStatus(PublishingStatus status);

    List<Page> findBySlugAndStatus(String slug, PublishingStatus status);

    boolean existsBySlugAndStatusAndPageIdNot(String slug, PublishingStatus status, UUID pageId);

    boolean existsBySlugAndStatus(String slug, PublishingStatus status);

    /**
     * Pages whose parent is the given page row.
     */
    List<Page> findByParentPageAndStatus(Page parentPage, PublishingStatus status);

    /**
     * Max sort order among the sibling pages of a given status (parent identified by its logical pageId).
     */
    @Query("""
            SELECT MAX(p.sortOrder)
            FROM Page p
            WHERE p.status = :status
              AND ((:parentPageId IS NULL AND p.parentPage IS NULL)
                OR p.parentPage.pageId = :parentPageId)
            """)
    Integer findMaxSortOrderByParentPageAndStatus(
            @Param("parentPageId") UUID parentPageId,
            @Param("status") PublishingStatus status
    );

    @Query("""
            SELECT p
            FROM Page p
            WHERE p.status = :status
              AND (LOWER(p.title) LIKE CONCAT('%', :q, '%')
                OR LOWER(p.name) LIKE CONCAT('%', :q, '%')
                OR LOWER(p.slug) LIKE CONCAT('%', :q, '%'))
            """)
    List<Page> search(
            @Param("q") String q,
            @Param("status") PublishingStatus status,
            Pageable pageable
    );

    @Query("""
            SELECT COUNT(d)
            FROM Page d
            WHERE d.pageId IN :pageIds
              AND d.status = com.stemadeleine.api.model.PublishingStatus.DRAFT
              AND NOT EXISTS (
                  SELECT 1 FROM Page p
                  WHERE p.pageId = d.pageId
                    AND p.status = com.stemadeleine.api.model.PublishingStatus.PUBLISHED
                    AND p.version = d.version)
            """)
    long countUnpublishedDrafts(@Param("pageIds") java.util.Collection<UUID> pageIds);
}
