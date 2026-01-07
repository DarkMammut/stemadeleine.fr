package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateNewsletterPublicationRequest;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.repository.MediaRepository;
import com.stemadeleine.api.repository.NewsPublicationRepository;
import com.stemadeleine.api.repository.NewsletterPublicationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsletterPublicationService {

    private final NewsletterPublicationRepository newsletterPublicationRepository;
    private final MediaRepository mediaRepository;
    private final NewsPublicationRepository newsPublicationRepository;

    /**
     * Get all newsletter publications excluding deleted ones
     */
    public List<NewsletterPublication> getAllNewsletterPublications() {
        log.info("Fetching all newsletter publications (excluding deleted)");
        List<NewsletterPublication> publications = newsletterPublicationRepository
                .findByStatusNot(PublishingStatus.DELETED);
        log.debug("Found {} newsletter publications", publications.size());
        return publications;
    }

    /**
     * Get paginated newsletter publications excluding deleted ones
     */
    public Page<NewsletterPublication> getAllNewsletterPublications(Pageable pageable) {
        log.info("Fetching paginated newsletter publications (excluding deleted)");
        Page<NewsletterPublication> publications = newsletterPublicationRepository
                .findByStatusNot(PublishingStatus.DELETED, pageable);
        log.debug("Found {} newsletter publications (page)", publications.getTotalElements());
        return publications;
    }

    /**
     * Get paginated newsletter publications with optional published filter
     */
    public Page<NewsletterPublication> getAllNewsletterPublications(Pageable pageable, Boolean published) {
        log.info("Fetching paginated newsletter publications with published filter={}", published);
        Page<NewsletterPublication> publications = newsletterPublicationRepository.findByPublishedFilter(published, pageable);
        log.debug("Found {} newsletter publications (page) with filter", publications.getTotalElements());
        return publications;
    }

    public Page<NewsletterPublication> getAllNewsletterPublications(Pageable pageable, Boolean published, String search) {
        log.info("Fetching paginated newsletter publications with published filter={} and search={}", published, search);
        Page<NewsletterPublication> publications;
        if (search != null && !search.isBlank()) {
            publications = newsletterPublicationRepository.findByPublishedFilterWithSearch(published, search.toLowerCase(), pageable);
        } else {
            publications = newsletterPublicationRepository.findByPublishedFilter(published, pageable);
        }
        log.debug("Found {} newsletter publications (page) with filter/search", publications.getTotalElements());
        return publications;
    }

    /**
     * Get newsletter publication by ID
     */
    public Optional<NewsletterPublication> getNewsletterPublicationById(UUID id) {
        log.info("Fetching newsletter publication with ID: {}", id);
        Optional<NewsletterPublication> publication = newsletterPublicationRepository.findById(id)
                .filter(p -> p.getStatus() != PublishingStatus.DELETED);
        log.debug("Newsletter publication found: {}", publication.isPresent());
        return publication;
    }

    /**
     * Get newsletter publication by newsletter ID (returns the latest version)
     */
    public Optional<NewsletterPublication> getNewsletterPublicationByNewsletterId(UUID newsletterId) {
        log.info("Fetching latest newsletter publication with newsletter ID: {}", newsletterId);
        Optional<NewsletterPublication> publication = newsletterPublicationRepository
                .findFirstByNewsletterIdOrderByCreatedAtDesc(newsletterId)
                .filter(p -> p.getStatus() != PublishingStatus.DELETED);
        log.debug("Newsletter publication found: {}", publication.isPresent());
        if (publication.isPresent()) {
            log.info("Found latest newsletter publication: id={}, newsletterId={}, createdAt={}",
                    publication.get().getId(),
                    publication.get().getNewsletterId(),
                    publication.get().getCreatedAt());
        } else {
            log.warn("No newsletter publication found for newsletterId: {}", newsletterId);
        }
        return publication;
    }

    /**
     * Get all published newsletters for public display
     */
    public List<NewsletterPublication> getPublishedNewsletters() {
        log.info("Fetching all published newsletters for public display");
        List<NewsletterPublication> newsletters = newsletterPublicationRepository
                .findByStatusAndIsVisible(PublishingStatus.PUBLISHED, true);
        log.debug("Found {} published newsletters", newsletters.size());
        return newsletters;
    }

    /**
     * Get paginated published newsletters for public display
     */
    public Page<NewsletterPublication> getPublishedNewsletters(Pageable pageable) {
        log.info("Fetching paginated published newsletters for public display");
        Page<NewsletterPublication> newsletters = newsletterPublicationRepository
                .findByStatusAndIsVisible(PublishingStatus.PUBLISHED, true, pageable);
        log.debug("Found {} published newsletters (page)", newsletters.getTotalElements());
        return newsletters;
    }

    /**
     * Create a new newsletter publication
     */
    @Transactional
    public NewsletterPublication createNewsletterPublication(CreateNewsletterPublicationRequest request, User author) {
        log.info("Creating new newsletter publication '{}' by user: {}", request.name(), author.getFirstname() + " " + author.getLastname());

        // Generate unique newsletter ID
        UUID newsletterId = UUID.randomUUID();
        while (newsletterPublicationRepository.existsByNewsletterId(newsletterId)) {
            newsletterId = UUID.randomUUID();
        }

        // Find media if provided
        Media media = null;
        if (request.mediaId() != null) {
            media = mediaRepository.findById(request.mediaId()).orElse(null);
            if (media == null) {
                log.warn("Media with ID {} not found, creating newsletter without media", request.mediaId());
            }
        }

        NewsletterPublication publication = NewsletterPublication.builder()
                .newsletterId(newsletterId)
                .name(request.name())
                .title(request.title())
                .description(request.description())
                .isVisible(request.isVisible() != null ? request.isVisible() : true)
                .status(PublishingStatus.DRAFT)
                .publishedDate(request.publishedDate())
                .media(media)
                .author(author)
                .build();

        NewsletterPublication savedPublication = newsletterPublicationRepository.save(publication);
        log.info("Newsletter publication created with ID: {}", savedPublication.getId());
        return savedPublication;
    }

    /**
     * Update newsletter publication basic info (name, title, description)
     */
    @Transactional
    public NewsletterPublication updateNewsletterPublication(UUID id, CreateNewsletterPublicationRequest request, User currentUser) {
        log.info("Updating newsletter publication {} by user: {}", id, currentUser.getFirstname() + " " + currentUser.getLastname());

        NewsletterPublication publication = newsletterPublicationRepository.findById(id)
                .filter(p -> p.getStatus() != PublishingStatus.DELETED)
                .orElseThrow(() -> {
                    log.error("Newsletter publication not found with ID: {}", id);
                    return new RuntimeException("Newsletter publication not found");
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

        // Update media if provided
        if (request.mediaId() != null) {
            Media media = mediaRepository.findById(request.mediaId()).orElse(null);
            publication.setMedia(media);
        }

        NewsletterPublication savedPublication = newsletterPublicationRepository.save(publication);
        log.info("Newsletter publication updated successfully");
        return savedPublication;
    }

    /**
     * Update newsletter publication visibility
     */
    @Transactional
    public NewsletterPublication updateVisibility(UUID id, Boolean isVisible, User currentUser) {
        log.info("Updating newsletter publication visibility {} to {} by user: {}",
                id, isVisible, currentUser.getFirstname() + " " + currentUser.getLastname());

        NewsletterPublication publication = newsletterPublicationRepository.findById(id)
                .filter(p -> p.getStatus() != PublishingStatus.DELETED)
                .orElseThrow(() -> {
                    log.error("Newsletter publication not found with ID: {}", id);
                    return new RuntimeException("Newsletter publication not found");
                });

        publication.setIsVisible(isVisible);
        NewsletterPublication savedPublication = newsletterPublicationRepository.save(publication);
        log.info("Newsletter publication visibility updated successfully");
        return savedPublication;
    }

    /**
     * Set media for newsletter publication
     */
    @Transactional
    public NewsletterPublication setMedia(UUID id, UUID mediaId, User currentUser) {
        log.info("Setting media {} for newsletter publication {} by user: {}",
                mediaId, id, currentUser.getFirstname() + " " + currentUser.getLastname());

        NewsletterPublication publication = newsletterPublicationRepository.findById(id)
                .filter(p -> p.getStatus() != PublishingStatus.DELETED)
                .orElseThrow(() -> {
                    log.error("Newsletter publication not found with ID: {}", id);
                    return new RuntimeException("Newsletter publication not found");
                });

        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> {
                    log.error("Media not found with ID: {}", mediaId);
                    return new RuntimeException("Media not found");
                });

        publication.setMedia(media);
        NewsletterPublication savedPublication = newsletterPublicationRepository.save(publication);
        log.info("Media set successfully for newsletter publication");
        return savedPublication;
    }

    /**
     * Remove media from newsletter publication
     */
    @Transactional
    public NewsletterPublication removeMedia(UUID id, User currentUser) {
        log.info("Removing media from newsletter publication {} by user: {}",
                id, currentUser.getFirstname() + " " + currentUser.getLastname());

        NewsletterPublication publication = newsletterPublicationRepository.findById(id)
                .filter(p -> p.getStatus() != PublishingStatus.DELETED)
                .orElseThrow(() -> {
                    log.error("Newsletter publication not found with ID: {}", id);
                    return new RuntimeException("Newsletter publication not found");
                });

        publication.setMedia(null);
        NewsletterPublication savedPublication = newsletterPublicationRepository.save(publication);
        log.info("Media removed successfully from newsletter publication");
        return savedPublication;
    }

    /**
     * Publish newsletter publication
     */
    @Transactional
    public NewsletterPublication publishNewsletter(UUID id, User currentUser) {
        log.info("Publishing newsletter publication {} by user: {}",
                id, currentUser.getFirstname() + " " + currentUser.getLastname());

        NewsletterPublication publication = newsletterPublicationRepository.findById(id)
                .filter(p -> p.getStatus() != PublishingStatus.DELETED)
                .orElseThrow(() -> {
                    log.error("Newsletter publication not found with ID: {}", id);
                    return new RuntimeException("Newsletter publication not found");
                });

        publication.setStatus(PublishingStatus.PUBLISHED);
        if (publication.getPublishedDate() == null) {
            publication.setPublishedDate(OffsetDateTime.now());
        }

        NewsletterPublication savedPublication = newsletterPublicationRepository.save(publication);
        log.info("Newsletter publication published successfully");
        return savedPublication;
    }

    /**
     * Soft delete newsletter publication
     */
    @Transactional
    public void softDeleteNewsletterPublication(UUID id, User currentUser) {
        log.info("Soft deleting newsletter publication {} by user: {}",
                id, currentUser.getFirstname() + " " + currentUser.getLastname());

        newsletterPublicationRepository.findById(id)
                .filter(p -> p.getStatus() != PublishingStatus.DELETED)
                .ifPresentOrElse(
                        publication -> {
                            publication.setStatus(PublishingStatus.DELETED);
                            newsletterPublicationRepository.save(publication);
                            log.info("Newsletter publication soft deleted successfully");
                        },
                        () -> {
                            log.error("Newsletter publication not found with ID: {}", id);
                            throw new RuntimeException("Newsletter publication not found");
                        }
                );
    }

    /**
     * Add a news publication to a newsletter
     */
    @Transactional
    public NewsletterPublication addNewsToNewsletter(UUID newsletterId, UUID newsId, User currentUser) {
        log.info("Adding news {} to newsletter {} by user: {}",
                newsId, newsletterId, currentUser.getFirstname() + " " + currentUser.getLastname());

        NewsletterPublication newsletter = newsletterPublicationRepository
                .findFirstByNewsletterIdOrderByCreatedAtDesc(newsletterId)
                .filter(p -> p.getStatus() != PublishingStatus.DELETED)
                .orElseThrow(() -> {
                    log.error("Newsletter publication not found with newsletterId: {}", newsletterId);
                    return new RuntimeException("Newsletter publication not found");
                });

        NewsPublication news = newsPublicationRepository.findById(newsId)
                .filter(p -> p.getStatus() != PublishingStatus.DELETED)
                .orElseThrow(() -> {
                    log.error("News publication not found with ID: {}", newsId);
                    return new RuntimeException("News publication not found");
                });

        if (!newsletter.getLinkedNews().contains(news)) {
            newsletter.getLinkedNews().add(news);
            newsletterPublicationRepository.save(newsletter);
            log.info("News added successfully to newsletter");
        } else {
            log.warn("News {} already linked to newsletter {}", newsId, newsletterId);
        }

        return newsletter;
    }

    /**
     * Remove a news publication from a newsletter
     */
    @Transactional
    public NewsletterPublication removeNewsFromNewsletter(UUID newsletterId, UUID newsId, User currentUser) {
        log.info("Removing news {} from newsletter {} by user: {}",
                newsId, newsletterId, currentUser.getFirstname() + " " + currentUser.getLastname());

        NewsletterPublication newsletter = newsletterPublicationRepository
                .findFirstByNewsletterIdOrderByCreatedAtDesc(newsletterId)
                .filter(p -> p.getStatus() != PublishingStatus.DELETED)
                .orElseThrow(() -> {
                    log.error("Newsletter publication not found with newsletterId: {}", newsletterId);
                    return new RuntimeException("Newsletter publication not found");
                });

        newsletter.getLinkedNews().removeIf(news -> news.getId().equals(newsId));
        newsletterPublicationRepository.save(newsletter);
        log.info("News removed successfully from newsletter");

        return newsletter;
    }

    /**
     * Get all news publications linked to a newsletter
     */
    public List<NewsPublication> getLinkedNews(UUID newsletterId) {
        log.info("Fetching news linked to newsletter {}", newsletterId);

        NewsletterPublication newsletter = newsletterPublicationRepository
                .findFirstByNewsletterIdOrderByCreatedAtDesc(newsletterId)
                .filter(p -> p.getStatus() != PublishingStatus.DELETED)
                .orElseThrow(() -> {
                    log.error("Newsletter publication not found with newsletterId: {}", newsletterId);
                    return new RuntimeException("Newsletter publication not found");
                });

        List<NewsPublication> linkedNews = newsletter.getLinkedNews();
        log.debug("Found {} news linked to newsletter", linkedNews.size());
        return linkedNews;
    }
}
