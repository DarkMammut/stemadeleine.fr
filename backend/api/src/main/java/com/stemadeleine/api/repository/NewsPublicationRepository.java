package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.NewsPublication;
import com.stemadeleine.api.model.PublishingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NewsPublicationRepository extends JpaRepository<NewsPublication, UUID> {

    /**
     * Find all news publications excluding deleted ones
     */
    List<NewsPublication> findByStatusNotOrderByCreatedAtDesc(PublishingStatus status);

    /**
     * Find news publication by news ID
     */
    Optional<NewsPublication> findByNewsId(UUID newsId);

    /**
     * Find all published news publications ordered by published date desc
     */
    @Query("SELECT n FROM NewsPublication n WHERE n.status = 'PUBLISHED' AND n.isVisible = true ORDER BY n.publishedDate DESC")
    List<NewsPublication> findPublishedNewsOrderByPublishedDateDesc();

    /**
     * Find news publications by author
     */
    List<NewsPublication> findByAuthor_IdAndStatusNotOrderByCreatedAtDesc(UUID authorId, PublishingStatus status);

    /**
     * Check if news ID already exists
     */
    boolean existsByNewsId(UUID newsId);
}
