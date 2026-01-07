package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.NewsletterPublication;
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
public interface NewsletterPublicationRepository extends JpaRepository<NewsletterPublication, UUID> {

    /**
     * Find all newsletter publications excluding deleted ones
     */
    // Allow Pageable to control ordering (do not hardcode ORDER BY in method name)
    List<NewsletterPublication> findByStatusNot(PublishingStatus status);

    Page<NewsletterPublication> findByStatusNot(PublishingStatus status, Pageable pageable);

    /**
     * Find newsletter publication by newsletter ID (returns the latest version)
     */
    Optional<NewsletterPublication> findFirstByNewsletterIdOrderByCreatedAtDesc(UUID newsletterId);

    /**
     * Find all published newsletter publications ordered by published date desc
     */
    // Derived query: allow Pageable/sort to be applied for published newsletters
    List<NewsletterPublication> findByStatusAndIsVisible(PublishingStatus status, Boolean isVisible);

    Page<NewsletterPublication> findByStatusAndIsVisible(PublishingStatus status, Boolean isVisible, Pageable pageable);

    /**
     * Find newsletter publications by author
     */
    // Allow Pageable to control ordering when fetching by author
    List<NewsletterPublication> findByAuthor_IdAndStatusNot(UUID authorId, PublishingStatus status);

    Page<NewsletterPublication> findByAuthor_IdAndStatusNot(UUID authorId, PublishingStatus status, Pageable pageable);

    /**
     * Check if newsletter ID already exists
     */
    boolean existsByNewsletterId(UUID newsletterId);

    /**
     * Paginated search with optional published filter (published = true => only PUBLISHED; false => not PUBLISHED; null => all except DELETED)
     */
    @Query("SELECT n FROM NewsletterPublication n WHERE n.status <> 'DELETED' " +
            "AND ( :published IS NULL OR ( :published = true AND n.status = 'PUBLISHED') OR ( :published = false AND n.status <> 'PUBLISHED') )")
    Page<NewsletterPublication> findByPublishedFilter(@Param("published") Boolean published, Pageable pageable);

    @Query("SELECT n FROM NewsletterPublication n WHERE n.status <> 'DELETED' " +
            "AND ( :published IS NULL OR ( :published = true AND n.status = 'PUBLISHED') OR ( :published = false AND n.status <> 'PUBLISHED') ) " +
            "AND ( :search IS NULL OR (LOWER(n.name) LIKE CONCAT('%',:search,'%') OR LOWER(n.title) LIKE CONCAT('%',:search,'%') OR LOWER(n.description) LIKE CONCAT('%',:search,'%')) )")
    Page<NewsletterPublication> findByPublishedFilterWithSearch(@Param("published") Boolean published, @Param("search") String search, Pageable pageable);
}
