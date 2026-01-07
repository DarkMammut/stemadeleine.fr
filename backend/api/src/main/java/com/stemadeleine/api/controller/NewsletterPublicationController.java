package com.stemadeleine.api.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stemadeleine.api.dto.ContentDto;
import com.stemadeleine.api.dto.CreateNewsletterPublicationRequest;
import com.stemadeleine.api.dto.NewsPublicationDto;
import com.stemadeleine.api.dto.NewsletterPublicationDto;
import com.stemadeleine.api.mapper.ContentMapper;
import com.stemadeleine.api.mapper.NewsPublicationMapper;
import com.stemadeleine.api.mapper.NewsletterPublicationMapper;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.service.ContentService;
import com.stemadeleine.api.service.NewsletterPublicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/newsletter-publication")
@RequiredArgsConstructor
public class NewsletterPublicationController {

    private final NewsletterPublicationService newsletterPublicationService;
    private final NewsletterPublicationMapper newsletterPublicationMapper;
    private final NewsPublicationMapper newsPublicationMapper;
    private final ContentService contentService;
    private final ContentMapper contentMapper;
    private final ObjectMapper objectMapper;

    /**
     * Get all newsletter publications (admin only) - paginated
     */
    @GetMapping
    public ResponseEntity<Page<NewsletterPublicationDto>> getAllNewsletterPublications(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            Pageable pageable,
            @RequestParam(name = "published", required = false) Boolean published,
            @RequestParam(name = "search", required = false) String search) {
        if (customUserDetails == null) {
            log.error("Attempt to fetch newsletter publications without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = customUserDetails.account().getUser();
        log.info("GET /api/newsletter-publications - Fetching all newsletter publications by user: {}",
                currentUser.getFirstname() + " " + currentUser.getLastname());
        try {
            Page<NewsletterPublication> publications =
                    newsletterPublicationService.getAllNewsletterPublications(pageable, published, search);
            Page<NewsletterPublicationDto> publicationsDto = publications.map(newsletterPublicationMapper::toDto);
            log.debug("Returning {} newsletter publications", publicationsDto.getTotalElements());
            return ResponseEntity.ok(publicationsDto);
        } catch (Exception e) {
            log.error("Error fetching newsletter publications: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get newsletter publication by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<NewsletterPublicationDto> getNewsletterPublicationById(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        if (customUserDetails == null) {
            log.error("Attempt to fetch newsletter publication without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = customUserDetails.account().getUser();
        log.info("GET /api/newsletters/{} - Fetching newsletter publication by user: {}",
                id, currentUser.getFirstname() + " " + currentUser.getLastname());
        try {
            return newsletterPublicationService.getNewsletterPublicationById(id)
                    .map(publication -> {
                        NewsletterPublicationDto dto = newsletterPublicationMapper.toDto(publication);
                        log.debug("Newsletter publication found: {}", publication.getName());
                        return ResponseEntity.ok(dto);
                    })
                    .orElseGet(() -> {
                        log.warn("Newsletter publication not found with ID: {}", id);
                        return ResponseEntity.notFound().build();
                    });
        } catch (Exception e) {
            log.error("Error fetching newsletter publication {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get newsletter publication by newsletter ID
     */
    @GetMapping("/newsletter/{newsletterId}")
    public ResponseEntity<NewsletterPublicationDto> getNewsletterPublicationByNewsletterId(
            @PathVariable UUID newsletterId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        if (customUserDetails == null) {
            log.error("Attempt to fetch newsletter publication by newsletter ID without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = customUserDetails.account().getUser();
        log.info("GET /api/newsletter-publications/by-newsletter/{} - Fetching newsletter publication by newsletter ID by user: {}",
                newsletterId, currentUser.getFirstname() + " " + currentUser.getLastname());
        try {
            return newsletterPublicationService.getNewsletterPublicationByNewsletterId(newsletterId)
                    .map(publication -> {
                        NewsletterPublicationDto dto = newsletterPublicationMapper.toDto(publication);
                        log.debug("Newsletter publication found: {}", publication.getName());
                        return ResponseEntity.ok(dto);
                    })
                    .orElseGet(() -> {
                        log.warn("Newsletter publication not found with newsletter ID: {}", newsletterId);
                        return ResponseEntity.notFound().build();
                    });
        } catch (Exception e) {
            log.error("Error fetching newsletter publication by newsletter ID {}: {}", newsletterId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get published newsletters for public display (no authentication required) - paginated
     */
    @GetMapping("/public")
    public ResponseEntity<Page<NewsletterPublicationDto>> getPublishedNewsletters(Pageable pageable) {
        log.info("GET /api/newsletter-publications/public - Fetching published newsletters");
        try {
            Page<NewsletterPublication> newsletters = newsletterPublicationService.getPublishedNewsletters(pageable);
            Page<NewsletterPublicationDto> newslettersDto = newsletters.map(newsletterPublicationMapper::toDto);
            log.debug("Returning {} published newsletters", newslettersDto.getTotalElements());
            return ResponseEntity.ok(newslettersDto);
        } catch (Exception e) {
            log.error("Error fetching published newsletters: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create a new newsletter publication
     */
    @PostMapping
    public ResponseEntity<NewsletterPublicationDto> createNewsletterPublication(
            @Valid @RequestBody CreateNewsletterPublicationRequest request,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        if (customUserDetails == null) {
            log.error("Attempt to create newsletter publication without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = customUserDetails.account().getUser();
        log.info("POST /api/newsletters - Creating newsletter publication '{}' by user: {}",
                request.name(), currentUser.getFirstname() + " " + currentUser.getLastname());
        try {
            NewsletterPublication createdPublication = newsletterPublicationService
                    .createNewsletterPublication(request, currentUser);
            NewsletterPublicationDto dto = newsletterPublicationMapper.toDto(createdPublication);

            log.info("Newsletter publication created successfully with ID: {}", createdPublication.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
        } catch (Exception e) {
            log.error("Error creating newsletter publication: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update newsletter publication
     */
    @PutMapping("/{id}")
    public ResponseEntity<NewsletterPublicationDto> updateNewsletterPublication(
            @PathVariable UUID id,
            @Valid @RequestBody CreateNewsletterPublicationRequest request,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        if (customUserDetails == null) {
            log.error("Attempt to update newsletter publication without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = customUserDetails.account().getUser();
        log.info("PUT /api/newsletters/{} - Updating newsletter publication by user: {}",
                id, currentUser.getFirstname() + " " + currentUser.getLastname());
        try {
            NewsletterPublication updatedPublication = newsletterPublicationService
                    .updateNewsletterPublication(id, request, currentUser);
            NewsletterPublicationDto dto = newsletterPublicationMapper.toDto(updatedPublication);

            log.info("Newsletter publication updated successfully");
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            log.error("Error updating newsletter publication {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error updating newsletter publication {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update newsletter publication visibility
     */
    @PutMapping("/{id}/visibility")
    public ResponseEntity<NewsletterPublicationDto> updateVisibility(
            @PathVariable UUID id,
            @RequestBody Map<String, Boolean> body,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        if (customUserDetails == null) {
            log.error("Attempt to update newsletter publication visibility without authentication");
            throw new RuntimeException("User not authenticated");
        }

        Boolean isVisible = body.get("isVisible");
        User currentUser = customUserDetails.account().getUser();
        log.info("PUT /api/newsletters/{}/visibility - Updating newsletter publication visibility to {} by user: {}",
                id, isVisible, currentUser.getFirstname() + " " + currentUser.getLastname());
        try {
            NewsletterPublication updatedPublication = newsletterPublicationService
                    .updateVisibility(id, isVisible, currentUser);
            NewsletterPublicationDto dto = newsletterPublicationMapper.toDto(updatedPublication);

            log.info("Newsletter publication visibility updated successfully");
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            log.error("Error updating newsletter publication visibility {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error updating newsletter publication visibility {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Set media for newsletter publication
     */
    @PutMapping("/{id}/media")
    public ResponseEntity<NewsletterPublicationDto> setMedia(
            @PathVariable UUID id,
            @RequestBody Map<String, UUID> body,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        if (customUserDetails == null) {
            log.error("Attempt to set media for newsletter publication without authentication");
            throw new RuntimeException("User not authenticated");
        }

        UUID mediaId = body.get("mediaId");
        User currentUser = customUserDetails.account().getUser();
        log.info("PUT /api/newsletters/{}/media - Setting media {} by user: {}",
                id, mediaId, currentUser.getFirstname() + " " + currentUser.getLastname());
        try {
            NewsletterPublication updatedPublication = newsletterPublicationService
                    .setMedia(id, mediaId, currentUser);
            NewsletterPublicationDto dto = newsletterPublicationMapper.toDto(updatedPublication);

            log.info("Media set successfully for newsletter publication");
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            log.error("Error setting media for newsletter publication {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error setting media for newsletter publication {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Remove media from newsletter publication
     */
    @DeleteMapping("/{id}/media")
    public ResponseEntity<NewsletterPublicationDto> removeMedia(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        if (customUserDetails == null) {
            log.error("Attempt to remove media from newsletter publication without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = customUserDetails.account().getUser();
        log.info("DELETE /api/newsletters/{}/media - Removing media by user: {}",
                id, currentUser.getFirstname() + " " + currentUser.getLastname());
        try {
            NewsletterPublication updatedPublication = newsletterPublicationService
                    .removeMedia(id, currentUser);
            NewsletterPublicationDto dto = newsletterPublicationMapper.toDto(updatedPublication);

            log.info("Media removed successfully from newsletter publication");
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            log.error("Error removing media from newsletter publication {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error removing media from newsletter publication {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Publish newsletter publication
     */
    @PutMapping("/{id}/publish")
    public ResponseEntity<NewsletterPublicationDto> publishNewsletter(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        if (customUserDetails == null) {
            log.error("Attempt to publish newsletter publication without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = customUserDetails.account().getUser();
        log.info("PUT /api/newsletters/{}/publish - Publishing newsletter by user: {}",
                id, currentUser.getFirstname() + " " + currentUser.getLastname());
        try {
            NewsletterPublication publishedNewsletter = newsletterPublicationService
                    .publishNewsletter(id, currentUser);
            NewsletterPublicationDto dto = newsletterPublicationMapper.toDto(publishedNewsletter);

            log.info("Newsletter publication published successfully");
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            log.error("Error publishing newsletter publication {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error publishing newsletter publication {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Soft delete newsletter publication
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNewsletterPublication(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        if (customUserDetails == null) {
            log.error("Attempt to delete newsletter publication without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = customUserDetails.account().getUser();
        log.info("DELETE /api/newsletters/{} - Soft deleting newsletter publication by user: {}",
                id, currentUser.getFirstname() + " " + currentUser.getLastname());
        try {

            newsletterPublicationService.softDeleteNewsletterPublication(id, currentUser);

            log.info("Newsletter publication soft deleted successfully");
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("Error deleting newsletter publication {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error deleting newsletter publication {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ----- NEWSLETTER CONTENT MANAGEMENT ROUTES -----

    @PostMapping("/{newsletterId}/contents")
    public ResponseEntity<ContentDto> createNewsletterContent(
            @PathVariable UUID newsletterId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        if (customUserDetails == null) {
            log.error("Attempt to create newsletter content without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = customUserDetails.account().getUser();
        String title = body.getOrDefault("title", "New Newsletter Content");

        log.info("POST /api/newsletter-publication/{}/contents - Creating new content by user: {}",
                newsletterId, currentUser.getFirstname() + " " + currentUser.getLastname());

        try {
            // Get the newsletter publication by newsletterId (module ID)
            // This ensures we work with the correct newsletter regardless of version
            NewsletterPublication newsletter = newsletterPublicationService
                    .getNewsletterPublicationByNewsletterId(newsletterId)
                    .orElseThrow(() -> new RuntimeException("Newsletter not found"));

            // Create content with newsletterId as owner
            // This ensures contents remain linked across different versions of the same newsletter
            JsonNode defaultBody = objectMapper.readTree("{\"html\": \"<p>Start writing your newsletter content here...</p>\"}");
            Content content = contentService.createContent(title, defaultBody, newsletterId, currentUser);

            ContentDto contentDto = contentMapper.toDto(content);
            log.info("Newsletter content created successfully with ID: {}", content.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(contentDto);
        } catch (RuntimeException e) {
            log.error("Error creating newsletter content: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            log.error("Error creating newsletter content: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{newsletterId}/contents")
    public ResponseEntity<List<ContentDto>> getNewsletterContents(
            @PathVariable UUID newsletterId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        if (customUserDetails == null) {
            log.error("Attempt to fetch newsletter contents without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = customUserDetails.account().getUser();
        log.info("GET /api/newsletter-publication/{}/contents - Fetching contents by user: {}",
                newsletterId, currentUser.getFirstname() + " " + currentUser.getLastname());

        try {
            // Get the newsletter publication by newsletterId (module ID)
            // This ensures we work with the correct newsletter regardless of version
            NewsletterPublication newsletter = newsletterPublicationService
                    .getNewsletterPublicationByNewsletterId(newsletterId)
                    .orElseThrow(() -> new RuntimeException("Newsletter not found"));

            // Get latest contents by newsletterId (owner)
            // This ensures contents are shared across all versions of the same newsletter
            List<Content> contents = contentService.getLatestContentsByOwner(newsletterId);
            List<ContentDto> contentDtos = contents.stream()
                    .map(contentMapper::toDto)
                    .collect(Collectors.toList());

            log.debug("Found {} contents for newsletter {}", contents.size(), newsletterId);
            return ResponseEntity.ok(contentDtos);
        } catch (RuntimeException e) {
            log.error("Error fetching newsletter contents {}: {}", newsletterId, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error fetching newsletter contents {}: {}", newsletterId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ----- NEWSLETTER NEWS LINKS MANAGEMENT ROUTES -----

    /**
     * Get all news linked to a newsletter
     */
    @GetMapping("/{newsletterId}/news")
    public ResponseEntity<List<NewsPublicationDto>> getLinkedNews(
            @PathVariable UUID newsletterId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        if (customUserDetails == null) {
            log.error("Attempt to fetch linked news without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = customUserDetails.account().getUser();
        log.info("GET /api/newsletter-publication/{}/news - Fetching linked news by user: {}",
                newsletterId, currentUser.getFirstname() + " " + currentUser.getLastname());

        try {
            List<NewsPublication> linkedNews = newsletterPublicationService.getLinkedNews(newsletterId);
            List<NewsPublicationDto> linkedNewsDto = linkedNews.stream()
                    .map(newsPublicationMapper::toDto)
                    .collect(Collectors.toList());

            log.debug("Found {} news linked to newsletter {}", linkedNews.size(), newsletterId);
            return ResponseEntity.ok(linkedNewsDto);
        } catch (RuntimeException e) {
            log.error("Error fetching linked news for newsletter {}: {}", newsletterId, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error fetching linked news for newsletter {}: {}", newsletterId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Add a news publication to a newsletter
     */
    @PostMapping("/{newsletterId}/news/{newsId}")
    public ResponseEntity<NewsletterPublicationDto> addNewsToNewsletter(
            @PathVariable UUID newsletterId,
            @PathVariable UUID newsId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        if (customUserDetails == null) {
            log.error("Attempt to add news to newsletter without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = customUserDetails.account().getUser();
        log.info("POST /api/newsletter-publication/{}/news/{} - Adding news to newsletter by user: {}",
                newsletterId, newsId, currentUser.getFirstname() + " " + currentUser.getLastname());

        try {
            NewsletterPublication updatedNewsletter = newsletterPublicationService
                    .addNewsToNewsletter(newsletterId, newsId, currentUser);
            NewsletterPublicationDto dto = newsletterPublicationMapper.toDto(updatedNewsletter);

            log.info("News added successfully to newsletter");
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            log.error("Error adding news to newsletter: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error adding news to newsletter: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Remove a news publication from a newsletter
     */
    @DeleteMapping("/{newsletterId}/news/{newsId}")
    public ResponseEntity<NewsletterPublicationDto> removeNewsFromNewsletter(
            @PathVariable UUID newsletterId,
            @PathVariable UUID newsId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        if (customUserDetails == null) {
            log.error("Attempt to remove news from newsletter without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = customUserDetails.account().getUser();
        log.info("DELETE /api/newsletter-publication/{}/news/{} - Removing news from newsletter by user: {}",
                newsletterId, newsId, currentUser.getFirstname() + " " + currentUser.getLastname());

        try {
            NewsletterPublication updatedNewsletter = newsletterPublicationService
                    .removeNewsFromNewsletter(newsletterId, newsId, currentUser);
            NewsletterPublicationDto dto = newsletterPublicationMapper.toDto(updatedNewsletter);

            log.info("News removed successfully from newsletter");
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            log.error("Error removing news from newsletter: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error removing news from newsletter: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
