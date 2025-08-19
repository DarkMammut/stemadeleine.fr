package com.stemadeleine.api.service;

import com.stemadeleine.api.model.Article;
import com.stemadeleine.api.repository.ArticleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;

    public List<Article> getAllArticles() {
        return articleRepository.findAll();
    }

    public Optional<Article> getArticleById(UUID id) {
        return articleRepository.findById(id);
    }

    public List<Article> getArticlesBySection(UUID sectionId) {
        return articleRepository.findBySectionIdOrderBySortOrderAsc(sectionId);
    }

    public Article createArticle(Article article) {
        article.setCreatedAt(Instant.now());
        article.setUpdatedAt(Instant.now());
        return articleRepository.save(article);
    }

    public Article updateArticle(UUID id, Article articleDetails) {
        return articleRepository.findById(id)
                .map(article -> {
                    article.setTitle(articleDetails.getTitle());
                    article.setBody(articleDetails.getBody());
                    article.setSortOrder(articleDetails.getSortOrder());
                    article.setIsVisible(articleDetails.getIsVisible());
                    article.setSection(articleDetails.getSection());
                    article.setUpdatedAt(Instant.now());
                    return articleRepository.save(article);
                })
                .orElseThrow(() -> new RuntimeException("Article not found"));
    }

    public void deleteArticle(UUID id) {
        articleRepository.deleteById(id);
    }
}
