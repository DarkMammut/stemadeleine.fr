package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateModuleRequest;
import com.stemadeleine.api.dto.UpdateArticlePutRequest;
import com.stemadeleine.api.dto.UpdateArticleRequest;
import com.stemadeleine.api.model.Article;
import com.stemadeleine.api.model.ArticleVariants;
import com.stemadeleine.api.model.PublishingStatus;
import com.stemadeleine.api.model.Section;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.ArticleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    /**
     * Working (DRAFT) articles.
     */
    public List<Article> getAllArticles() {
        return articleRepository.findByStatus(PublishingStatus.DRAFT);
    }

    public Optional<Article> getArticleById(UUID id) {
        return articleRepository.findById(id)
                .filter(a -> a.getStatus() == PublishingStatus.DRAFT || a.getStatus() == PublishingStatus.PUBLISHED);
    }

    /**
     * DRAFT of an article (backoffice).
     */
    public Optional<Article> getLastVersionByModuleId(UUID moduleId) {
        return articleRepository.findByModuleIdAndStatus(moduleId, PublishingStatus.DRAFT);
    }

    /**
     * PUBLISHED version of an article (public site).
     */
    public Optional<Article> getPublishedByModuleId(UUID moduleId) {
        return articleRepository.findByModuleIdAndStatus(moduleId, PublishingStatus.PUBLISHED);
    }

    @Transactional
    public Article updateArticle(UUID id, UpdateArticlePutRequest request) {
        Article article = moduleService.findDraftByRowId(articleRepository, id)
                .orElseThrow(() -> new RuntimeException("Draft article not found"));

        if (request.getTitle() != null) article.setTitle(request.getTitle());
        if (request.getName() != null) article.setName(request.getName());
        if (request.getSortOrder() != null) article.setSortOrder(request.getSortOrder());
        if (request.getVariant() != null) article.setVariant(request.getVariant());
        if (request.getWriter() != null) article.setWriter(request.getWriter());
        if (request.getWritingDate() != null) article.setWritingDate(request.getWritingDate());

        return moduleService.saveDraft(article);
    }

    /**
     * Updates the DRAFT of the article in place (no new row).
     */
    @Transactional
    public Article createArticleVersion(UpdateArticleRequest request, User author) {
        Article article = articleRepository.findByModuleIdAndStatus(request.moduleId(), PublishingStatus.DRAFT)
                .orElseThrow(() -> new RuntimeException("Draft article not found for moduleId: " + request.moduleId()));

        if (request.name() != null) article.setName(request.name());
        if (request.title() != null) article.setTitle(request.title());
        if (request.variant() != null) article.setVariant(request.variant());
        if (request.writer() != null) article.setWriter(request.writer());
        if (request.writingDate() != null) article.setWritingDate(request.writingDate());
        article.setAuthor(author);

        return moduleService.saveDraft(article);
    }

    /**
     * Deletes the article: DRAFT -> DELETED, PUBLISHED -> ARCHIVED.
     */
    @Transactional
    public void softDeleteArticle(UUID id) {
        moduleService.softDeleteModuleByRowId(id);
    }

    @Transactional
    public Article publishArticle(UUID moduleId, User author) {
        return (Article) moduleService.publishModule(moduleId, author);
    }

    @Transactional
    public Article createArticleWithModule(CreateModuleRequest request, User author) {
        Section section = moduleService.getDraftSection(request.sectionId());

        Article article = Article.builder()
                .moduleId(UUID.randomUUID())
                .variant(ArticleVariants.STAGGERED)
                .contents(new ArrayList<>())
                .section(section)
                .name(request.name())
                .title(request.name())
                .type("ARTICLE")
                .sortOrder(0)
                .isVisible(false)
                .status(PublishingStatus.DRAFT)
                .author(author)
                .version(1)
                .build();

        return articleRepository.save(article);
    }
}
