package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.ArticleDto;
import com.stemadeleine.api.dto.CreateModuleRequest;
import com.stemadeleine.api.dto.UpdateArticlePutRequest;
import com.stemadeleine.api.dto.UpdateArticleRequest;
import com.stemadeleine.api.mapper.ArticleMapper;
import com.stemadeleine.api.model.Article;
import com.stemadeleine.api.model.ArticleVariants;
import com.stemadeleine.api.model.CustomUserDetails;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.service.ArticleService;
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
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;
    private final ArticleMapper articleMapper;

    @GetMapping
    public List<ArticleDto> getAllArticles() {
        log.info("GET /api/articles - Retrieving all articles");
        List<Article> articles = articleService.getAllArticles();
        log.debug("Number of articles found: {}", articles.size());
        return articles.stream()
                .map(articleMapper::toDto)
                .toList();
    }

    @GetMapping("/variants")
    public ResponseEntity<List<String>> getArticleVariants() {
        log.info("GET /api/articles/variants - Retrieving available article variants");
        List<String> variants = Arrays.stream(ArticleVariants.values())
                .map(Enum::name)
                .collect(Collectors.toList());
        log.debug("Article variants: {}", variants);
        return ResponseEntity.ok(variants);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArticleDto> getArticleById(@PathVariable UUID id) {
        log.info("GET /api/articles/{} - Retrieving article by ID", id);
        return articleService.getArticleById(id)
                .map(article -> {
                    log.debug("Article found: {}", article.getId());
                    return ResponseEntity.ok(articleMapper.toDto(article));
                })
                .orElseGet(() -> {
                    log.warn("Article not found with ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @GetMapping("/by-module-id/{moduleId}")
    public ResponseEntity<ArticleDto> getArticleByModuleId(@PathVariable UUID moduleId) {
        log.info("GET /api/articles/by-module-id/{} - Retrieving latest article version by moduleId", moduleId);
        return articleService.getLastVersionByModuleId(moduleId)
                .map(article -> {
                    log.debug("Article found: {} (version {})", article.getId(), article.getVersion());
                    return ResponseEntity.ok(articleMapper.toDto(article));
                })
                .orElseGet(() -> {
                    log.warn("Article not found with moduleId: {}", moduleId);
                    return ResponseEntity.notFound().build();
                });
    }

    @PostMapping
    public ResponseEntity<ArticleDto> createArticleWithModule(@RequestBody CreateModuleRequest request, @AuthenticationPrincipal CustomUserDetails currentUserDetails) {
        if (currentUserDetails == null) {
            throw new RuntimeException("User not authenticated");
        }
        User currentUser = currentUserDetails.account().getUser();
        log.info("POST /api/articles - Creating a new article for section: {}", request.sectionId());
        Article article = articleService.createArticleWithModule(request, currentUser);
        log.debug("Article created with ID: {}", article.getId());
        return ResponseEntity.ok(articleMapper.toDto(article));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ArticleDto> updateArticle(@PathVariable UUID id, @RequestBody UpdateArticlePutRequest request) {
        log.info("PUT /api/articles/{} - Updating an article", id);
        try {
            Article updated = articleService.updateArticle(id, request);
            log.debug("Article updated: {}", updated.getId());
            return ResponseEntity.ok(articleMapper.toDto(updated));
        } catch (RuntimeException e) {
            log.error("Error updating article {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArticle(@PathVariable UUID id) {
        log.info("DELETE /api/articles/{} - Deleting an article", id);
        articleService.softDeleteArticle(id);
        log.debug("Article deleted: {}", id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/version")
    public ResponseEntity<ArticleDto> createNewVersionForModule(
            @RequestBody UpdateArticleRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails) {
        if (currentUserDetails == null) {
            throw new RuntimeException("User not authenticated");
        }
        User currentUser = currentUserDetails.account().getUser();
        log.info("POST /api/articles/version - Creating a new version for module: {}", request.moduleId());
        Article article = articleService.createArticleVersion(request, currentUser);
        log.debug("New version created with ID: {}", article.getId());
        return ResponseEntity.ok(articleMapper.toDto(article));
    }
}

