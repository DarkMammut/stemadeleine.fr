package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateArticleRequest;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.repository.ArticleRepository;
import com.stemadeleine.api.repository.ContentRepository;
import com.stemadeleine.api.utils.JsonUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final ModuleService moduleService;
    private final ContentRepository contentRepository;

    public List<Article> getAllArticles() {
        log.info("Récupération de tous les articles non supprimés");
        List<Article> articles = articleRepository.findByStatusNot(PublishingStatus.DELETED);
        log.debug("Nombre d'articles trouvés : {}", articles.size());
        return articles;
    }

    public Optional<Article> getArticleById(UUID id) {
        log.info("Recherche de l'article avec l'ID : {}", id);
        Optional<Article> article = articleRepository.findById(id)
                .filter(a -> a.getStatus() != PublishingStatus.DELETED);
        log.debug("Article trouvé : {}", article.isPresent());
        return article;
    }

    public Article updateArticle(UUID id, Article articleDetails) {
        log.info("Mise à jour de l'article avec l'ID : {}", id);
        return articleRepository.findById(id)
                .map(article -> {
                    article.setTitle(articleDetails.getTitle());
                    article.setSortOrder(articleDetails.getSortOrder());
                    article.setIsVisible(articleDetails.getIsVisible());
                    article.setVariant(articleDetails.getVariant());
                    if (articleDetails.getContents() != null) {
                        article.setContents(articleDetails.getContents());
                    }
                    log.debug("Article mis à jour : {}", article);
                    return articleRepository.save(article);
                })
                .orElseThrow(() -> {
                    log.error("Article non trouvé avec l'ID : {}", id);
                    return new RuntimeException("Article not found");
                });
    }

    public void softDeleteArticle(UUID id) {
        log.info("Suppression logique de l'article avec l'ID : {}", id);
        articleRepository.findById(id).ifPresent(article -> {
            article.setStatus(PublishingStatus.DELETED);
            articleRepository.save(article);
            log.debug("Article marqué comme supprimé : {}", id);
        });
    }

    public Article createArticleWithModule(CreateArticleRequest request, User author) {
        log.info("Création d'un nouvel article pour la section : {}", request.sectionId());

        // Créer le module de type ARTICLE
        Module module = moduleService.createNewModule(
                request.sectionId(),
                request.name(),
                "ARTICLE",
                author
        );
        log.debug("Module créé avec l'ID : {}", module.getId());

        // Créer un contenu générique conforme au modèle
        Content content = Content.builder()
                .ownerId(module.getId())
                .version(1)
                .status(PublishingStatus.DRAFT)
                .isVisible(false)
                .title(request.name())
                .body(JsonUtils.createEmptyJsonNode())
                .build();
        contentRepository.save(content);
        log.debug("Contenu créé avec l'ID : {}", content.getId());

        // Créer l'article et le lier au module
        Article article = Article.builder()
                .variant(ArticleVariants.STAGGERED)
                .contents(List.of(content))
                .moduleId(module.getModuleId())
                .section(module.getSection())
                .name(module.getName())
                .title(module.getTitle())
                .type(module.getType())
                .sortOrder(module.getSortOrder())
                .isVisible(module.getIsVisible())
                .status(module.getStatus())
                .author(author)
                .version(1)
                .build();

        Article savedArticle = articleRepository.save(article);
        log.info("Article créé avec succès, ID : {}", savedArticle.getId());
        return savedArticle;
    }
}
