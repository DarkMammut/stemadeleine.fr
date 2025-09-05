package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.CreateNewsRequest;
import com.stemadeleine.api.dto.NewsDto;
import com.stemadeleine.api.mapper.NewsMapper;
import com.stemadeleine.api.model.CustomUserDetails;
import com.stemadeleine.api.model.News;
import com.stemadeleine.api.service.NewsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsController {
    private final NewsService newsService;
    private final NewsMapper newsMapper;

    @GetMapping
    public List<NewsDto> getAllNews() {
        log.info("GET /api/news - Récupération de toutes les actualités");
        List<News> newsList = newsService.getAllNews();
        log.debug("Nombre d'actualités trouvées : {}", newsList.size());
        return newsList.stream().map(newsMapper::toDto).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<NewsDto> getNewsById(@PathVariable UUID id) {
        log.info("GET /api/news/{} - Récupération d'une actualité par ID", id);
        return newsService.getNewsById(id)
                .map(news -> {
                    log.debug("Actualité trouvée : {}", news.getId());
                    return ResponseEntity.ok(newsMapper.toDto(news));
                })
                .orElseGet(() -> {
                    log.warn("Actualité non trouvée avec l'ID : {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @PostMapping
    public ResponseEntity<NewsDto> createNews(
            @RequestBody CreateNewsRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            log.error("Tentative de création d'actualité sans authentification");
            throw new RuntimeException("User not authenticated");
        }

        log.info("POST /api/news - Création d'une nouvelle actualité");
        News news = newsService.createNewsWithModule(request, currentUserDetails.account().getUser());
        log.debug("Actualité créée avec l'ID : {}", news.getId());
        return ResponseEntity.ok(newsMapper.toDto(news));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NewsDto> updateNews(@PathVariable UUID id, @RequestBody News newsDetails) {
        log.info("PUT /api/news/{} - Mise à jour d'une actualité", id);
        try {
            News updatedNews = newsService.updateNews(id, newsDetails);
            log.debug("Actualité mise à jour : {}", updatedNews.getId());
            return ResponseEntity.ok(newsMapper.toDto(updatedNews));
        } catch (RuntimeException e) {
            log.error("Erreur lors de la mise à jour de l'actualité {} : {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNews(@PathVariable UUID id) {
        log.info("DELETE /api/news/{} - Suppression d'une actualité", id);
        newsService.softDeleteNews(id);
        log.debug("Actualité supprimée : {}", id);
        return ResponseEntity.noContent().build();
    }
}
