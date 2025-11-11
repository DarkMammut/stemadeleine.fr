package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.CreateModuleRequest;
import com.stemadeleine.api.dto.NewsDto;
import com.stemadeleine.api.dto.UpdateNewsPutRequest;
import com.stemadeleine.api.dto.UpdateNewsRequest;
import com.stemadeleine.api.mapper.NewsMapper;
import com.stemadeleine.api.model.CustomUserDetails;
import com.stemadeleine.api.model.News;
import com.stemadeleine.api.model.NewsVariants;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.service.NewsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsController {
    private final NewsService newsService;
    private final NewsMapper newsMapper;

    @GetMapping
    public List<NewsDto> getAllNews() {
        log.info("GET /api/news - Retrieving all news");
        List<News> newsList = newsService.getAllNews();
        log.debug("Number of news found: {}", newsList.size());
        return newsList.stream().map(newsMapper::toDto).toList();
    }

    @GetMapping("/variants")
    public ResponseEntity<List<String>> getNewsVariants() {
        log.info("GET /api/news/variants - Retrieving available news variants");
        List<String> variants = Arrays.stream(NewsVariants.values())
                .map(Enum::name)
                .collect(Collectors.toList());
        log.debug("News variants: {}", variants);
        return ResponseEntity.ok(variants);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NewsDto> getNewsById(@PathVariable UUID id) {
        log.info("GET /api/news/{} - Retrieving news by ID", id);
        return newsService.getNewsById(id)
                .map(news -> {
                    log.debug("News found: {}", news.getId());
                    return ResponseEntity.ok(newsMapper.toDto(news));
                })
                .orElseGet(() -> {
                    log.warn("News not found with ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @GetMapping("/by-module-id/{moduleId}")
    public ResponseEntity<NewsDto> getNewsByModuleId(@PathVariable UUID moduleId) {
        log.info("GET /api/news/by-module-id/{} - Retrieving latest news version by moduleId", moduleId);
        return newsService.getLastVersionByModuleId(moduleId)
                .map(news -> {
                    log.debug("News found: {} (version {})", news.getId(), news.getVersion());
                    return ResponseEntity.ok(newsMapper.toDto(news));
                })
                .orElseGet(() -> {
                    log.warn("News not found with moduleId: {}", moduleId);
                    return ResponseEntity.notFound().build();
                });
    }

    @PostMapping
    public ResponseEntity<NewsDto> createNews(
            @RequestBody CreateModuleRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            log.error("Attempt to create news without authentication");
            throw new RuntimeException("User not authenticated");
        }

        log.info("POST /api/news - Creating new news");
        News news = newsService.createNewsWithModule(request, currentUserDetails.account().getUser());
        log.debug("News created with ID: {}", news.getId());
        return ResponseEntity.ok(newsMapper.toDto(news));
    }

    @PostMapping("/version")
    public ResponseEntity<NewsDto> createNewVersionForModule(
            @RequestBody UpdateNewsRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails) {
        if (currentUserDetails == null) {
            throw new RuntimeException("User not authenticated");
        }
        User currentUser = currentUserDetails.account().getUser();
        log.info("POST /api/news/version - Creating new version for module: {}", request.moduleId());
        News news = newsService.createNewsVersion(request, currentUser);
        log.debug("New version created with ID: {}", news.getId());
        return ResponseEntity.ok(newsMapper.toDto(news));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NewsDto> updateNews(@PathVariable UUID id, @RequestBody UpdateNewsPutRequest request) {
        log.info("PUT /api/news/{} - Updating news", id);
        try {
            News updatedNews = newsService.updateNews(id, request);
            log.debug("News updated: {}", updatedNews.getId());
            return ResponseEntity.ok(newsMapper.toDto(updatedNews));
        } catch (RuntimeException e) {
            log.error("Error updating news {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNews(@PathVariable UUID id) {
        log.info("DELETE /api/news/{} - Deleting news", id);
        newsService.softDeleteNews(id);
        log.debug("News deleted: {}", id);
        return ResponseEntity.noContent().build();
    }
}
