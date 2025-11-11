package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateModuleRequest;
import com.stemadeleine.api.dto.UpdateArticlePutRequest;
import com.stemadeleine.api.dto.UpdateArticleRequest;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.repository.ArticleRepository;
import com.stemadeleine.api.repository.SectionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final ModuleService moduleService;
    private final SectionRepository sectionRepository;

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

    public Optional<Article> getLastVersionByModuleId(UUID moduleId) {
        log.info("Recherche de la dernière version de l'article avec le moduleId : {}", moduleId);
        Optional<Article> article = articleRepository.findTopByModuleIdOrderByVersionDesc(moduleId)
                .filter(a -> a.getStatus() != PublishingStatus.DELETED);
        log.debug("Article trouvé : {}", article.isPresent());
        return article;
    }

    public Article updateArticle(UUID id, UpdateArticlePutRequest request) {
        log.info("Mise à jour de l'article avec l'ID : {}", id);
        return articleRepository.findById(id)
                .map(article -> {
                    if (request.getTitle() != null) {
                        article.setTitle(request.getTitle());
                    }
                    if (request.getName() != null) {
                        article.setName(request.getName());
                    }
                    if (request.getSortOrder() != null) {
                        article.setSortOrder(request.getSortOrder());
                    }
                    if (request.getVariant() != null) {
                        article.setVariant(request.getVariant());
                    }
                    if (request.getWriter() != null) {
                        article.setWriter(request.getWriter());
                    }
                    if (request.getWritingDate() != null) {
                        article.setWritingDate(request.getWritingDate());
                    }
                    log.debug("Article mis à jour : {}", article);
                    return articleRepository.save(article);
                })
                .orElseThrow(() -> {
                    log.error("Article non trouvé avec l'ID : {}", id);
                    return new RuntimeException("Article not found");
                });
    }

    public Article createArticleVersion(UpdateArticleRequest request, User author) {
        log.info("Création d'une nouvelle version d'article pour le moduleId : {}", request.moduleId());

        // 1. Récupérer le module
        Module module = moduleService.getModuleByModuleId(request.moduleId())
                .orElseThrow(() -> new RuntimeException("Module not found for id: " + request.moduleId()));

        // 2. Récupérer la dernière version de l'article pour ce module
        Article previousArticle = articleRepository.findTopByModuleIdOrderByVersionDesc(request.moduleId())
                .orElse(null);

        // 3. Fusionner les infos du request et de la version précédente
        String name = request.name() != null ? request.name() : (previousArticle != null ? previousArticle.getName() : module.getName());
        String title = request.title() != null ? request.title() : (previousArticle != null ? previousArticle.getTitle() : module.getTitle());
        ArticleVariants variant = request.variant() != null ? request.variant() : (previousArticle != null ? previousArticle.getVariant() : ArticleVariants.STAGGERED);
        List<Content> contents = previousArticle != null ? new ArrayList<>(previousArticle.getContents()) : new ArrayList<>();
        String type = module.getType();
        Integer sortOrder = module.getSortOrder();
        Boolean isVisible = module.getIsVisible();
        PublishingStatus status = PublishingStatus.DRAFT;
        int newVersion = previousArticle != null ? previousArticle.getVersion() + 1 : 1;
        String writer = request.writer() != null ? request.writer() : (previousArticle != null ? previousArticle.getWriter() : null);
        java.time.LocalDate writingDate = request.writingDate() != null ? request.writingDate() : (previousArticle != null ? previousArticle.getWritingDate() : null);

        Article article = Article.builder()
                .variant(variant)
                .contents(contents)
                .moduleId(module.getModuleId())
                .section(module.getSection())
                .name(name)
                .title(title)
                .type(type)
                .sortOrder(sortOrder)
                .isVisible(isVisible)
                .status(status)
                .author(author)
                .version(newVersion)
                .writer(writer)
                .writingDate(writingDate)
                .build();

        Article savedArticle = articleRepository.save(article);
        log.info("Nouvelle version d'article créée avec succès, ID : {}", savedArticle.getId());
        return savedArticle;
    }

    public void softDeleteArticle(UUID id) {
        log.info("Suppression logique de l'article avec l'ID : {}", id);
        articleRepository.findById(id).ifPresent(article -> {
            article.setStatus(PublishingStatus.DELETED);
            articleRepository.save(article);
            log.debug("Article marqué comme supprimé : {}", id);
        });
    }

    public Article createArticleWithModule(CreateModuleRequest request, User author) {
        log.info("Création d'un nouvel article pour la section : {}", request.sectionId());

        // Récupérer la section à partir de l'UUID
        Section section = sectionRepository.findTopBySectionIdOrderByVersionDesc(request.sectionId())
                .orElseThrow(() -> new RuntimeException("Section not found for id: " + request.sectionId()));

        // Créer l'article et le lier au module
        Article article = Article.builder()
                .moduleId(UUID.randomUUID())
                .variant(ArticleVariants.STAGGERED)
                .contents(new java.util.ArrayList<>())
                .section(section)
                .name(request.name())
                .title(request.name())
                .type("ARTICLE")
                .sortOrder(0)
                .isVisible(false)
                .status(PublishingStatus.DRAFT)
                .author(author)
                .version(1)
                .writer(null)
                .writingDate(null)
                .build();

        Article savedArticle = articleRepository.save(article);
        log.info("Article créé avec succès, ID : {}", savedArticle.getId());
        return savedArticle;
    }
}
