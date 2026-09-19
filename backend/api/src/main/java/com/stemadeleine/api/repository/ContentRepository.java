package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.Content;
import com.stemadeleine.api.model.PublishingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContentRepository extends JpaRepository<Content, UUID> {

    /**
     * Find a content by its logical ID and status,
     * including its medias.
     */
    @Query("""
            SELECT DISTINCT c
            FROM Content c
            LEFT JOIN FETCH c.medias
            WHERE c.contentId = :contentId
              AND c.status = :status
            """)
    Optional<Content> findByContentIdAndStatus(
            @Param("contentId") UUID contentId,
            @Param("status") PublishingStatus status
    );

    /**
     * Find contents by owner and status,
     * including their medias.
     */
    @Query("""
            SELECT DISTINCT c
            FROM Content c
            LEFT JOIN FETCH c.medias
            WHERE c.ownerId = :ownerId
              AND c.status = :status
            ORDER BY c.sortOrder ASC
            """)
    List<Content> findByOwnerIdAndStatusOrderBySortOrderAsc(
            @Param("ownerId") UUID ownerId,
            @Param("status") PublishingStatus status
    );

    /**
     * Find the maximum sort order for an owner/status.
     */
    @Query("""
            SELECT MAX(c.sortOrder)
            FROM Content c
            WHERE c.ownerId = :ownerId
              AND c.status = :status
            """)
    Integer findMaxSortOrderByOwnerAndStatus(
            @Param("ownerId") UUID ownerId,
            @Param("status") PublishingStatus status
    );

    /**
     * Check if a logical content exists.
     */
    boolean existsByContentId(UUID contentId);

    /**
     * Find a content by database ID with its medias.
     */
    @Query("""
            SELECT DISTINCT c
            FROM Content c
            LEFT JOIN FETCH c.medias
            WHERE c.id = :id
            """)
    Optional<Content> findByIdWithMedias(
            @Param("id") UUID id
    );
}