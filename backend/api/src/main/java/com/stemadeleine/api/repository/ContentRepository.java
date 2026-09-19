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
     * Find a content by its logical ID and status.
     */
    Optional<Content> findByContentIdAndStatus(
            UUID contentId,
            PublishingStatus status
    );

    /**
     * Find contents by owner and status.
     */
    List<Content> findByOwnerIdAndStatusOrderBySortOrderAsc(
            UUID ownerId,
            PublishingStatus status
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
            SELECT c
            FROM Content c
            LEFT JOIN FETCH c.medias
            WHERE c.id = :id
            """)
    Optional<Content> findByIdWithMedias(
            @Param("id") UUID id
    );
}