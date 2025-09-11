package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.Content;
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
     * Find latest version of a content by contentId
     */
    Optional<Content> findTopByContentIdOrderByVersionDesc(UUID contentId);

    /**
     * Find all contents by owner ordered by sort order
     */
    List<Content> findByOwnerIdOrderBySortOrderAsc(UUID ownerId);

    /**
     * Find latest versions of all contents for a specific owner (excluding deleted)
     */
    @Query("""
            SELECT c FROM Content c 
            WHERE c.ownerId = :ownerId 
            AND c.version = (
                SELECT MAX(c2.version) 
                FROM Content c2 
                WHERE c2.contentId = c.contentId
            )
            AND c.status != 'DELETED'
            ORDER BY c.sortOrder ASC
            """)
    List<Content> findLatestContentsByOwner(@Param("ownerId") UUID ownerId);

    /**
     * Find maximum sort order for contents of a specific owner
     */
    @Query("""
            SELECT MAX(c.sortOrder) 
            FROM Content c 
            WHERE c.ownerId = :ownerId 
            AND c.version = (
                SELECT MAX(c2.version) 
                FROM Content c2 
                WHERE c2.contentId = c.contentId
            )
            AND c.status != 'DELETED'
            """)
    Integer findMaxSortOrderByOwner(@Param("ownerId") UUID ownerId);

    /**
     * Find all versions of a content by contentId
     */
    List<Content> findByContentIdOrderByVersionDesc(UUID contentId);

    /**
     * Check if content exists by contentId
     */
    boolean existsByContentId(UUID contentId);

    /**
     * Find all contents with a specific status by owner
     */
    List<Content> findByOwnerIdAndStatus(UUID ownerId, String status);

    /**
     * Find a specific version of a content by contentId
     */
    Optional<Content> findByContentIdAndVersion(UUID contentId, Integer version);

    /**
     * Delete a content by contentId
     */
    void deleteByContentId(UUID contentId);
}
