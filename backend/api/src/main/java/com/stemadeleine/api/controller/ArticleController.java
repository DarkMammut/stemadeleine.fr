package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.CreateArticleRequest;
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

    @GetMapping
    public List<Article> getAllArticles() {
        return articleService.getAllArticles();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Article> getArticleById(@PathVariable UUID id) {
        return articleService.getArticleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Article> createArticleWithModule(@RequestBody CreateArticleRequest request, @AuthenticationPrincipal CustomUserDetails currentUserDetails) {
        if (currentUserDetails == null) {
            throw new RuntimeException("User not authenticated");
        }
        User currentUser = currentUserDetails.account().getUser();
        Article article = articleService.createArticleWithModule(request, currentUser);
        return ResponseEntity.ok(article);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Article> updateArticle(@PathVariable UUID id, @RequestBody Article articleDetails) {
        try {
            return ResponseEntity.ok(articleService.updateArticle(id, articleDetails));
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
