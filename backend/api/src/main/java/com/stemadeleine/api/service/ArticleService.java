package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateArticleRequest;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.repository.ArticleRepository;
import com.stemadeleine.api.repository.ContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final ModuleService moduleService;
    private final ContentRepository contentRepository;

    public List<Article> getAllArticles() {
        return articleRepository.findByStatusNot(PublishingStatus.DELETED);
    }

    public Optional<Article> getArticleById(UUID id) {
        return articleRepository.findById(id)
                .filter(article -> article.getStatus() != PublishingStatus.DELETED);
    }

    public Article updateArticle(UUID id, Article articleDetails) {
        return articleRepository.findById(id)
                .map(article -> {
                    article.setTitle(articleDetails.getTitle());
                    article.setSortOrder(articleDetails.getSortOrder());
                    article.setIsVisible(articleDetails.getIsVisible());
                    return articleRepository.save(article);
                })
                .orElseThrow(() -> new RuntimeException("Article not found"));
    }

    public void softDeleteArticle(UUID id) {
        articleRepository.findById(id).ifPresent(article -> {
            article.setStatus(PublishingStatus.DELETED);
            articleRepository.save(article);
        });
    }

    public Article createArticleWithModule(CreateArticleRequest request, User author) {
        // Créer le module de type ARTICLE
        Module module = moduleService.createNewModule(
                request.sectionId(),
                request.name(),
                "ARTICLE",
                author
        );

        // Créer un contenu générique conforme au modèle
        Content content = Content.builder()
                .ownerId(module.getId())
                .version(1)
                .status(PublishingStatus.DRAFT)
                .isVisible(false)
                .title(request.name())
                .body("")
                .build();
        contentRepository.save(content);

        // Créer l'article et le lier au module
        Article article = Article.builder()
                .variant(ArticleVariants.STAGGERED)
                .contents(List.of(content))
                .build();
        return articleRepository.save(article);
    }
}
