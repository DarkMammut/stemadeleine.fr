package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateNewsPublicationRequest;
import com.stemadeleine.api.model.Media;
import com.stemadeleine.api.model.NewsPublication;
import com.stemadeleine.api.model.PublishingStatus;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.MediaRepository;
import com.stemadeleine.api.repository.NewsPublicationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsPublicationService {

    private final NewsPublicationRepository newsPublicationRepository;
    private final MediaRepository mediaRepository;

    /**
     * Get all news publications excluding deleted ones
     */
    public List<NewsPublication> getAllNewsPublications() {
        log.info("Fetching all news publications (excluding deleted)");
        List<NewsPublication> publications = newsPublicationRepository
                .findByStatusNotOrderByCreatedAtDesc(PublishingStatus.DELETED);
        log.debug("Found {} news publications", publications.size());
        return publications;
    }

    /**
     * Get news publication by ID
     */
    public Optional<NewsPublication> getNewsPublicationById(UUID id) {
        log.info("Fetching news publication with ID: {}", id);
        Optional<NewsPublication> publication = newsPublicationRepository.findById(id)
                .filter(p -> p.getStatus() != PublishingStatus.DELETED);
        log.debug("News publication found: {}", publication.isPresent());
        return publication;
    }

    /**
     * Get news publication by news ID
     */
    public Optional<NewsPublication> getNewsPublicationByNewsId(UUID newsId) {
        log.info("Fetching news publication with news ID: {}", newsId);
        Optional<NewsPublication> publication = newsPublicationRepository
                .findByNewsId(newsId)
                .filter(p -> p.getStatus() != PublishingStatus.DELETED);
        log.debug("News publication found: {}", publication.isPresent());
        return publication;
    }

    /**
     * Get all published news for public display
     */
    public List<NewsPublication> getPublishedNews() {
        log.info("Fetching all published news for public display");
        List<NewsPublication> news = newsPublicationRepository
                .findPublishedNewsOrderByPublishedDateDesc();
        log.debug("Found {} published news", news.size());
        return news;
    }

    /**
     * Create a new news publication
     */
    @Transactional
    public NewsPublication createNewsPublication(CreateNewsPublicationRequest request, User author) {
        log.info("Creating new news publication '{}' by user: {}", request.name(), author.getFirstname() + " " + author.getLastname());

        // Generate unique news ID
        UUID newsId = UUID.randomUUID();
        while (newsPublicationRepository.existsByNewsId(newsId)) {
            newsId = UUID.randomUUID();
        }

        // Find media if provided
        Media media = null;
        if (request.mediaId() != null) {
            media = mediaRepository.findById(request.mediaId()).orElse(null);
            if (media == null) {
                log.warn("Media with ID {} not found, creating news without media", request.mediaId());
            }
        }

        NewsPublication publication = NewsPublication.builder()
                .newsId(newsId)
                .name(request.name())
                .title(request.title())
                .description(request.description())
                .isVisible(request.isVisible() != null ? request.isVisible() : true)
                .status(PublishingStatus.DRAFT)
                .publishedDate(request.publishedDate())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .media(media)
                .author(author)
                .build();

        NewsPublication savedPublication = newsPublicationRepository.save(publication);
        log.info("News publication created with ID: {}", savedPublication.getId());
        return savedPublication;
    }

    /**
     * Update news publication basic info (name, title, description)
     */
    @Transactional
    public NewsPublication updateNewsPublication(UUID id, CreateNewsPublicationRequest request, User currentUser) {
        log.info("Updating news publication {} by user: {}", id, currentUser.getFirstname() + " " + currentUser.getLastname());

        NewsPublication publication = newsPublicationRepository.findById(id)
                .filter(p -> p.getStatus() != PublishingStatus.DELETED)
                .orElseThrow(() -> {
                    log.error("News publication not found with ID: {}", id);
                    return new RuntimeException("News publication not found");
                });

        // Update fields
        publication.setName(request.name());
        publication.setTitle(request.title());
        publication.setDescription(request.description());
        if (request.isVisible() != null) {
            publication.setIsVisible(request.isVisible());
        }
        if (request.publishedDate() != null) {
            publication.setPublishedDate(request.publishedDate());
        }
        if (request.startDate() != null) {
            publication.setStartDate(request.startDate());
        }
        if (request.endDate() != null) {
            publication.setEndDate(request.endDate());
        }

        // Update media if provided
        if (request.mediaId() != null) {
            Media media = mediaRepository.findById(request.mediaId()).orElse(null);
            publication.setMedia(media);
        }

        NewsPublication savedPublication = newsPublicationRepository.save(publication);
        log.info("News publication updated successfully");
        return savedPublication;
    }

    /**
     * Update news publication visibility
     */
    @Transactional
    public NewsPublication updateVisibility(UUID id, Boolean isVisible, User currentUser) {
        log.info("Updating news publication visibility {} to {} by user: {}",
                id, isVisible, currentUser.getFirstname() + " " + currentUser.getLastname());

        NewsPublication publication = newsPublicationRepository.findById(id)
                .filter(p -> p.getStatus() != PublishingStatus.DELETED)
                .orElseThrow(() -> {
                    log.error("News publication not found with ID: {}", id);
                    return new RuntimeException("News publication not found");
                });

        publication.setIsVisible(isVisible);
        NewsPublication savedPublication = newsPublicationRepository.save(publication);
        log.info("News publication visibility updated successfully");
        return savedPublication;
    }

    /**
     * Set media for news publication
     */
    @Transactional
    public NewsPublication setMedia(UUID id, UUID mediaId, User currentUser) {
        log.info("Setting media {} for news publication {} by user: {}",
                mediaId, id, currentUser.getFirstname() + " " + currentUser.getLastname());

        NewsPublication publication = newsPublicationRepository.findById(id)
                .filter(p -> p.getStatus() != PublishingStatus.DELETED)
                .orElseThrow(() -> {
                    log.error("News publication not found with ID: {}", id);
                    return new RuntimeException("News publication not found");
                });

        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> {
                    log.error("Media not found with ID: {}", mediaId);
                    return new RuntimeException("Media not found");
                });

        publication.setMedia(media);
        NewsPublication savedPublication = newsPublicationRepository.save(publication);
        log.info("Media set successfully for news publication");
        return savedPublication;
    }

    /**
     * Remove media from news publication
     */
    @Transactional
    public NewsPublication removeMedia(UUID id, User currentUser) {
        log.info("Removing media from news publication {} by user: {}",
                id, currentUser.getFirstname() + " " + currentUser.getLastname());

        NewsPublication publication = newsPublicationRepository.findById(id)
                .filter(p -> p.getStatus() != PublishingStatus.DELETED)
                .orElseThrow(() -> {
                    log.error("News publication not found with ID: {}", id);
                    return new RuntimeException("News publication not found");
                });

        publication.setMedia(null);
        NewsPublication savedPublication = newsPublicationRepository.save(publication);
        log.info("Media removed successfully from news publication");
        return savedPublication;
    }

    /**
     * Publish news publication
     */
    @Transactional
    public NewsPublication publishNews(UUID id, User currentUser) {
        log.info("Publishing news publication {} by user: {}",
                id, currentUser.getFirstname() + " " + currentUser.getLastname());

        NewsPublication publication = newsPublicationRepository.findById(id)
                .filter(p -> p.getStatus() != PublishingStatus.DELETED)
                .orElseThrow(() -> {
                    log.error("News publication not found with ID: {}", id);
                    return new RuntimeException("News publication not found");
                });

        publication.setStatus(PublishingStatus.PUBLISHED);
        if (publication.getPublishedDate() == null) {
            publication.setPublishedDate(OffsetDateTime.now());
        }

        NewsPublication savedPublication = newsPublicationRepository.save(publication);
        log.info("News publication published successfully");
        return savedPublication;
    }

    /**
     * Soft delete news publication
     */
    @Transactional
    public void softDeleteNewsPublication(UUID id, User currentUser) {
        log.info("Soft deleting news publication {} by user: {}",
                id, currentUser.getFirstname() + " " + currentUser.getLastname());

        newsPublicationRepository.findById(id)
                .filter(p -> p.getStatus() != PublishingStatus.DELETED)
                .ifPresentOrElse(
                        publication -> {
                            publication.setStatus(PublishingStatus.DELETED);
                            newsPublicationRepository.save(publication);
                            log.info("News publication soft deleted successfully");
                        },
                        () -> {
                            log.error("News publication not found with ID: {}", id);
                            throw new RuntimeException("News publication not found");
                        }
                );
    }
}
