package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.NewsPublication;
import com.stemadeleine.api.model.PublishingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NewsPublicationRepository extends JpaRepository<NewsPublication, UUID> {

    /**
     * Find all news publications excluding deleted ones
     */
    // Allow Pageable to control ordering (do not hardcode ORDER BY in method name)
    List<NewsPublication> findByStatusNot(PublishingStatus status);

    Page<NewsPublication> findByStatusNot(PublishingStatus status, Pageable pageable);

    /**
     * Find news publication by news ID
     */
    Optional<NewsPublication> findByNewsId(UUID newsId);

    /**
     * Find all published news publications ordered by published date desc
     */
    // Derived query: allow Pageable/sort to be applied (e.g. sort=publishedDate,desc or createdAt)
    List<NewsPublication> findByStatusAndIsVisible(PublishingStatus status, Boolean isVisible);

    Page<NewsPublication> findByStatusAndIsVisible(PublishingStatus status, Boolean isVisible, Pageable pageable);

    /**
     * Find news publications by author
     */
    // Allow Pageable to control ordering when fetching by author
    List<NewsPublication> findByAuthor_IdAndStatusNot(UUID authorId, PublishingStatus status);

    Page<NewsPublication> findByAuthor_IdAndStatusNot(UUID authorId, PublishingStatus status, Pageable pageable);

    /**
     * Check if news ID already exists
     */
    boolean existsByNewsId(UUID newsId);

    /**
     * Paginated search with optional published and active filters.
     * - published = true => only PUBLISHED, false => not PUBLISHED, null => all except DELETED
     * - active = true => startDate <= CURRENT_DATE AND (endDate IS NULL OR endDate >= CURRENT_DATE)
     */
    @Query("SELECT n FROM NewsPublication n WHERE n.status <> 'DELETED' " +
            "AND ( :published IS NULL OR ( :published = true AND n.status = 'PUBLISHED') OR ( :published = false AND n.status <> 'PUBLISHED') ) " +
            "AND ( :active IS NULL OR ( :active = true AND n.startDate <= CURRENT_DATE AND (n.endDate IS NULL OR n.endDate >= CURRENT_DATE)) OR ( :active = false AND (n.startDate > CURRENT_DATE OR (n.endDate IS NOT NULL AND n.endDate < CURRENT_DATE)) ) )")
    Page<NewsPublication> findByFilters(@Param("published") Boolean published, @Param("active") Boolean active, Pageable pageable);

    @Query("SELECT n FROM NewsPublication n WHERE n.status <> 'DELETED' " +
            "AND ( :published IS NULL OR ( :published = true AND n.status = 'PUBLISHED') OR ( :published = false AND n.status <> 'PUBLISHED') ) " +
            "AND ( :active IS NULL OR ( :active = true AND n.startDate <= CURRENT_DATE AND (n.endDate IS NULL OR n.endDate >= CURRENT_DATE)) OR ( :active = false AND (n.startDate > CURRENT_DATE OR (n.endDate IS NOT NULL AND n.endDate < CURRENT_DATE)) ) ) " +
            "AND ( :search IS NULL OR (LOWER(n.name) LIKE CONCAT('%',:search,'%') OR LOWER(n.title) LIKE CONCAT('%',:search,'%') OR LOWER(n.description) LIKE CONCAT('%',:search,'%')) )")
    Page<NewsPublication> findByFiltersWithSearch(@Param("published") Boolean published, @Param("active") Boolean active, @Param("search") String search, Pageable pageable);
}
