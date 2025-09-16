package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.NewsletterPublication;
import com.stemadeleine.api.model.PublishingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NewsletterPublicationRepository extends JpaRepository<NewsletterPublication, UUID> {

    /**
     * Find all newsletter publications excluding deleted ones
     */
    List<NewsletterPublication> findByStatusNotOrderByCreatedAtDesc(PublishingStatus status);

    /**
     * Find newsletter publication by newsletter ID
     */
    Optional<NewsletterPublication> findByNewsletterId(UUID newsletterId);

    /**
     * Find all published newsletter publications ordered by published date desc
     */
    @Query("SELECT n FROM NewsletterPublication n WHERE n.status = 'PUBLISHED' AND n.isVisible = true ORDER BY n.publishedDate DESC")
    List<NewsletterPublication> findPublishedNewslettersOrderByPublishedDateDesc();

    /**
     * Find newsletter publications by author
     */
    List<NewsletterPublication> findByAuthor_IdAndStatusNotOrderByCreatedAtDesc(UUID authorId, PublishingStatus status);

    /**
     * Check if newsletter ID already exists
     */
    boolean existsByNewsletterId(UUID newsletterId);
}
