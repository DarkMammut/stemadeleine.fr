package com.stemadeleine.api.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stemadeleine.api.dto.ContentDto;
import com.stemadeleine.api.dto.CreateNewsPublicationRequest;
import com.stemadeleine.api.dto.NewsPublicationDto;
import com.stemadeleine.api.mapper.ContentMapper;
import com.stemadeleine.api.mapper.NewsPublicationMapper;
import com.stemadeleine.api.model.Content;
import com.stemadeleine.api.model.CustomUserDetails;
import com.stemadeleine.api.model.NewsPublication;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.service.ContentService;
import com.stemadeleine.api.service.NewsPublicationService;
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
@RequestMapping("/api/news-publications")
@RequiredArgsConstructor
public class NewsPublicationController {

    private final NewsPublicationService newsPublicationService;
    private final NewsPublicationMapper newsPublicationMapper;
    private final ContentService contentService;
    private final ContentMapper contentMapper;
    private final ObjectMapper objectMapper;

    /**
     * Get all news publications (admin only) - paginated
     */
    @GetMapping
    public ResponseEntity<Page<NewsPublicationDto>> getAllNewsPublications(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            Pageable pageable,
            @RequestParam(name = "published", required = false) Boolean published,
            @RequestParam(name = "active", required = false) Boolean active,
            @RequestParam(name = "search", required = false) String search) {
        if (customUserDetails == null) {
            log.error("Attempt to fetch news publications without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = customUserDetails.account().getUser();
        log.info("GET /api/news-publications - Fetching all news publications by user: {}",
                currentUser.getFirstname() + " " + currentUser.getLastname());
        try {
            Page<NewsPublication> publications = newsPublicationService.getAllNewsPublications(pageable, published, active, search);
            Page<NewsPublicationDto> publicationsDto = publications.map(newsPublicationMapper::toDto);
            log.debug("Returning {} news publications", publicationsDto.getTotalElements());
            return ResponseEntity.ok(publicationsDto);
        } catch (Exception e) {
            log.error("Error fetching news publications: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get news publication by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<NewsPublicationDto> getNewsPublicationById(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        if (customUserDetails == null) {
            log.error("Attempt to fetch news publication without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = customUserDetails.account().getUser();
        log.info("GET /api/news-publications/{} - Fetching news publication by user: {}",
                id, currentUser.getFirstname() + " " + currentUser.getLastname());
        try {
            return newsPublicationService.getNewsPublicationById(id)
                    .map(publication -> {
                        NewsPublicationDto dto = newsPublicationMapper.toDto(publication);
                        log.debug("News publication found: {}", publication.getName());
                        return ResponseEntity.ok(dto);
                    })
                    .orElseGet(() -> {
                        log.warn("News publication not found with ID: {}", id);
                        return ResponseEntity.notFound().build();
                    });
        } catch (Exception e) {
            log.error("Error fetching news publication {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get news publication by news ID
     */
    @GetMapping("/by-news/{newsId}")
    public ResponseEntity<NewsPublicationDto> getNewsPublicationByNewsId(
            @PathVariable UUID newsId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        if (customUserDetails == null) {
            log.error("Attempt to fetch news publication by news ID without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = customUserDetails.account().getUser();
        log.info("GET /api/news-publications/by-news/{} - Fetching news publication by news ID by user: {}",
                newsId, currentUser.getFirstname() + " " + currentUser.getLastname());
        try {
            return newsPublicationService.getNewsPublicationByNewsId(newsId)
                    .map(publication -> {
                        NewsPublicationDto dto = newsPublicationMapper.toDto(publication);
                        log.debug("News publication found: {}", publication.getName());
                        return ResponseEntity.ok(dto);
                    })
                    .orElseGet(() -> {
                        log.warn("News publication not found with news ID: {}", newsId);
                        return ResponseEntity.notFound().build();
                    });
        } catch (Exception e) {
            log.error("Error fetching news publication by news ID {}: {}", newsId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get published news for public display (no authentication required) - paginated
     */
    @GetMapping("/public")
    public ResponseEntity<Page<NewsPublicationDto>> getPublishedNews(Pageable pageable) {
        log.info("GET /api/news-publications/public - Fetching published news");
        try {
            Page<NewsPublication> news = newsPublicationService.getPublishedNews(pageable);
            Page<NewsPublicationDto> newsDto = news.map(newsPublicationMapper::toDto);
            log.debug("Returning {} published news", newsDto.getTotalElements());
            return ResponseEntity.ok(newsDto);
        } catch (Exception e) {
            log.error("Error fetching published news: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create a new news publication
     */
    @PostMapping
    public ResponseEntity<NewsPublicationDto> createNewsPublication(
            @Valid @RequestBody CreateNewsPublicationRequest request,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        if (customUserDetails == null) {
            log.error("Attempt to create news publication without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = customUserDetails.account().getUser();
        log.info("POST /api/news-publications - Creating news publication '{}' by user: {}",
                request.name(), currentUser.getFirstname() + " " + currentUser.getLastname());
        try {
            NewsPublication createdPublication = newsPublicationService
                    .createNewsPublication(request, currentUser);
            NewsPublicationDto dto = newsPublicationMapper.toDto(createdPublication);

            log.info("News publication created successfully with ID: {}", createdPublication.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
        } catch (Exception e) {
            log.error("Error creating news publication: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update news publication
     */
    @PutMapping("/{id}")
    public ResponseEntity<NewsPublicationDto> updateNewsPublication(
            @PathVariable UUID id,
            @Valid @RequestBody CreateNewsPublicationRequest request,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        if (customUserDetails == null) {
            log.error("Attempt to update news publication without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = customUserDetails.account().getUser();
        log.info("PUT /api/news-publications/{} - Updating news publication by user: {}",
                id, currentUser.getFirstname() + " " + currentUser.getLastname());
        try {
            NewsPublication updatedPublication = newsPublicationService
                    .updateNewsPublication(id, request, currentUser);
            NewsPublicationDto dto = newsPublicationMapper.toDto(updatedPublication);

            log.info("News publication updated successfully");
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            log.error("Error updating news publication {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error updating news publication {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update news publication visibility
     */
    @PutMapping("/{id}/visibility")
    public ResponseEntity<NewsPublicationDto> updateVisibility(
            @PathVariable UUID id,
            @RequestBody Map<String, Boolean> body,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        if (customUserDetails == null) {
            log.error("Attempt to update news publication visibility without authentication");
            throw new RuntimeException("User not authenticated");
        }

        Boolean isVisible = body.get("isVisible");
        User currentUser = customUserDetails.account().getUser();
        log.info("PUT /api/news-publications/{}/visibility - Updating news publication visibility to {} by user: {}",
                id, isVisible, currentUser.getFirstname() + " " + currentUser.getLastname());
        try {
            NewsPublication updatedPublication = newsPublicationService
                    .updateVisibility(id, isVisible, currentUser);
            NewsPublicationDto dto = newsPublicationMapper.toDto(updatedPublication);

            log.info("News publication visibility updated successfully");
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            log.error("Error updating news publication visibility {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error updating news publication visibility {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Set media for news publication
     */
    @PutMapping("/{id}/media")
    public ResponseEntity<NewsPublicationDto> setMedia(
            @PathVariable UUID id,
            @RequestBody Map<String, UUID> body,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        if (customUserDetails == null) {
            log.error("Attempt to set media for news publication without authentication");
            throw new RuntimeException("User not authenticated");
        }

        UUID mediaId = body.get("mediaId");
        User currentUser = customUserDetails.account().getUser();
        log.info("PUT /api/news-publications/{}/media - Setting media {} by user: {}",
                id, mediaId, currentUser.getFirstname() + " " + currentUser.getLastname());
        try {
            NewsPublication updatedPublication = newsPublicationService
                    .setMedia(id, mediaId, currentUser);
            NewsPublicationDto dto = newsPublicationMapper.toDto(updatedPublication);

            log.info("Media set successfully for news publication");
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            log.error("Error setting media for news publication {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error setting media for news publication {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Remove media from news publication
     */
    @DeleteMapping("/{id}/media")
    public ResponseEntity<NewsPublicationDto> removeMedia(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        if (customUserDetails == null) {
            log.error("Attempt to remove media from news publication without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = customUserDetails.account().getUser();
        log.info("DELETE /api/news-publications/{}/media - Removing media by user: {}",
                id, currentUser.getFirstname() + " " + currentUser.getLastname());
        try {
            NewsPublication updatedPublication = newsPublicationService
                    .removeMedia(id, currentUser);
            NewsPublicationDto dto = newsPublicationMapper.toDto(updatedPublication);

            log.info("Media removed successfully from news publication");
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            log.error("Error removing media from news publication {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error removing media from news publication {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Publish news publication
     */
    @PutMapping("/{id}/publish")
    public ResponseEntity<NewsPublicationDto> publishNews(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        if (customUserDetails == null) {
            log.error("Attempt to publish news publication without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = customUserDetails.account().getUser();
        log.info("PUT /api/news-publications/{}/publish - Publishing news by user: {}",
                id, currentUser.getFirstname() + " " + currentUser.getLastname());
        try {
            NewsPublication publishedNews = newsPublicationService
                    .publishNews(id, currentUser);
            NewsPublicationDto dto = newsPublicationMapper.toDto(publishedNews);

            log.info("News publication published successfully");
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            log.error("Error publishing news publication {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error publishing news publication {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Soft delete news publication
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNewsPublication(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        if (customUserDetails == null) {
            log.error("Attempt to delete news publication without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = customUserDetails.account().getUser();
        log.info("DELETE /api/news-publications/{} - Soft deleting news publication by user: {}",
                id, currentUser.getFirstname() + " " + currentUser.getLastname());
        try {

            newsPublicationService.softDeleteNewsPublication(id, currentUser);

            log.info("News publication soft deleted successfully");
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("Error deleting news publication {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error deleting news publication {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ----- NEWSLETTER CONTENT MANAGEMENT ROUTES -----

    @PostMapping("/{newsId}/contents")
    public ResponseEntity<ContentDto> createNewsContent(
            @PathVariable UUID newsId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        if (customUserDetails == null) {
            log.error("Attempt to create news content without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = customUserDetails.account().getUser();
        String title = body.getOrDefault("title", "New News Content");

        log.info("POST /api/news-publications/{}/contents - Creating new content by user: {}",
                newsId, currentUser.getFirstname() + " " + currentUser.getLastname());

        try {
            // Get the news publication by its ID (not by newsId)
            NewsPublication news = newsPublicationService
                    .getNewsPublicationById(newsId)
                    .orElseThrow(() -> new RuntimeException("News not found"));

            // Create content with newsId as owner (not the publication ID)
            // This ensures contents remain linked across different versions of the same news
            JsonNode defaultBody = objectMapper.readTree("{\"html\": \"<p>Start writing your news content here...</p>\"}");
            Content content = contentService.createContent(title, defaultBody, news.getNewsId(), currentUser);

            ContentDto contentDto = contentMapper.toDto(content);
            log.info("News content created successfully with ID: {}", content.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(contentDto);
        } catch (Exception e) {
            log.error("Error creating news content: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{newsId}/contents")
    public ResponseEntity<List<ContentDto>> getNewsContents(
            @PathVariable UUID newsId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        if (customUserDetails == null) {
            log.error("Attempt to fetch news contents without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = customUserDetails.account().getUser();
        log.info("GET /api/news-publications/{}/contents - Fetching contents by user: {}",
                newsId, currentUser.getFirstname() + " " + currentUser.getLastname());

        try {
            // Get the news publication by its ID (not by newsId)
            NewsPublication news = newsPublicationService
                    .getNewsPublicationById(newsId)
                    .orElseThrow(() -> new RuntimeException("News not found"));

            // Get latest contents by newsId (owner)
            // This ensures contents are shared across all versions of the same news
            List<Content> contents = contentService.getLatestContentsByOwner(news.getNewsId());
            List<ContentDto> contentDtos = contents.stream()
                    .map(contentMapper::toDto)
                    .collect(Collectors.toList());

            log.debug("Found {} contents for news {}", contents.size(), newsId);
            return ResponseEntity.ok(contentDtos);
        } catch (RuntimeException e) {
            log.error("Error fetching news contents {}: {}", newsId, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error fetching news contents {}: {}", newsId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
