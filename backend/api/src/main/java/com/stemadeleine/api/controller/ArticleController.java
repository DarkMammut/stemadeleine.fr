package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.ArticleDto;
import com.stemadeleine.api.dto.CreateArticleRequest;
import com.stemadeleine.api.mapper.ArticleMapper;
import com.stemadeleine.api.model.Article;
import com.stemadeleine.api.model.CustomUserDetails;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;
    private final ArticleMapper articleMapper;

    @GetMapping
    public List<ArticleDto> getAllArticles() {
        return articleService.getAllArticles().stream()
                .map(articleMapper::toDto)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArticleDto> getArticleById(@PathVariable UUID id) {
        return articleService.getArticleById(id)
                .map(articleMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ArticleDto> createArticleWithModule(@RequestBody CreateArticleRequest request, @AuthenticationPrincipal CustomUserDetails currentUserDetails) {
        if (currentUserDetails == null) {
            throw new RuntimeException("User not authenticated");
        }
        User currentUser = currentUserDetails.account().getUser();
        Article article = articleService.createArticleWithModule(request, currentUser);
        return ResponseEntity.ok(articleMapper.toDto(article));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ArticleDto> updateArticle(@PathVariable UUID id, @RequestBody Article articleDetails) {
        try {
            Article updated = articleService.updateArticle(id, articleDetails);
            return ResponseEntity.ok(articleMapper.toDto(updated));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArticle(@PathVariable UUID id) {
        articleService.softDeleteArticle(id);
        return ResponseEntity.noContent().build();
    }
}
