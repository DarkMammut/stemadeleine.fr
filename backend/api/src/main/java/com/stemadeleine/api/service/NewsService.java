package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateModuleRequest;
import com.stemadeleine.api.dto.UpdateNewsPutRequest;
import com.stemadeleine.api.dto.UpdateNewsRequest;
import com.stemadeleine.api.model.News;
import com.stemadeleine.api.model.NewsVariants;
import com.stemadeleine.api.model.Page;
import com.stemadeleine.api.model.PublishingStatus;
import com.stemadeleine.api.model.Section;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.NewsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsService {

    private static final String DETAIL_PAGE_URL = "/actualites";

    private final NewsRepository newsRepository;
    private final ModuleService moduleService;
    private final PageService pageService;
    private final SectionService sectionService;

    public List<News> getAllNews() {
        return newsRepository.findByStatus(PublishingStatus.DRAFT);
    }

    public Optional<News> getNewsById(UUID id) {
        return newsRepository.findById(id)
                .filter(n -> n.getStatus() == PublishingStatus.DRAFT || n.getStatus() == PublishingStatus.PUBLISHED);
    }

    /**
     * DRAFT of a news module (backoffice).
     */
    public Optional<News> getLastVersionByModuleId(UUID moduleId) {
        return newsRepository.findByModuleIdAndStatus(moduleId, PublishingStatus.DRAFT);
    }

    /**
     * PUBLISHED version of a news module (public site).
     */
    public Optional<News> getPublishedByModuleId(UUID moduleId) {
        return newsRepository.findByModuleIdAndStatus(moduleId, PublishingStatus.PUBLISHED);
    }

    public boolean existsNewsWithVariantAll() {
        return newsRepository.existsByVariantAndStatus(NewsVariants.ALL, PublishingStatus.DRAFT);
    }

    /**
     * Creates and publishes the pages structure of the news: /actualites, its section,
     * the dynamic detail page and the "all news" module.
     */
    @Transactional
    public Map<String, UUID> createNewsPagesStructure(User author) {
        log.info("Création de la structure complète pour les pages Actualités avec URL fixe /actualites");

        Page actualitesPage = pageService.createNewPage(null, "Actualités", author);
        actualitesPage = pageService.updatePage(
                actualitesPage.getPageId(), "Actualités", "Actualités", null, "/actualites", null, true, author);

        Section section = sectionService.createNewSection(actualitesPage.getPageId(), "Section Actualités", author);
        section = sectionService.updateSection(
                section.getSectionId(), "Section Actualités", "Section Actualités", true, author);

        // Dynamic detail page [newsId], not visible in the navigation
        Page detailPage = pageService.createNewPage(actualitesPage.getPageId(), "[newsId]", author);
        detailPage = pageService.updatePage(
                detailPage.getPageId(), "[newsId]", "[newsId]", null, "/[newsId]", null, false, author);

        News news = News.builder()
                .moduleId(UUID.randomUUID())
                .variant(NewsVariants.ALL)
                .contents(new ArrayList<>())
                .section(section)
                .name("Toutes les actualités")
                .title("Toutes les actualités")
                .type("NEWS")
                .sortOrder(0)
                .isVisible(true)
                .status(PublishingStatus.DRAFT)
                .author(author)
                .version(1)
                .description("Module pour afficher toutes les actualités")
                .detailPageUrl(DETAIL_PAGE_URL)
                .build();
        News savedNews = newsRepository.save(news);

        // The module is published together with its section (the page must be published first)
        pageService.publishPage(actualitesPage.getPageId(), author);
        sectionService.publishSection(section.getSectionId(), author);

        // All the other news modules (DRAFT and PUBLISHED rows) share the same detail page
        for (PublishingStatus status : List.of(PublishingStatus.DRAFT, PublishingStatus.PUBLISHED)) {
            for (News existingNews : newsRepository.findByStatus(status)) {
                if (!existingNews.getModuleId().equals(savedNews.getModuleId())) {
                    existingNews.setDetailPageUrl(DETAIL_PAGE_URL);
                    newsRepository.save(existingNews);
                }
            }
        }

        Map<String, UUID> result = new HashMap<>();
        result.put("actualitesPageId", actualitesPage.getPageId());
        result.put("detailPageId", detailPage.getPageId());
        result.put("sectionId", section.getSectionId());
        result.put("newsModuleId", savedNews.getModuleId());
        return result;
    }

    @Transactional
    public News updateNews(UUID id, UpdateNewsPutRequest request) {
        News news = moduleService.findDraftByRowId(newsRepository, id)
                .orElseThrow(() -> new RuntimeException("News not found"));

        if (request.getTitle() != null) news.setTitle(request.getTitle());
        if (request.getName() != null) news.setName(request.getName());
        if (request.getSortOrder() != null) news.setSortOrder(request.getSortOrder());
        if (request.getVariant() != null) news.setVariant(request.getVariant());

        return moduleService.saveDraft(news);
    }

    @Transactional
    public void softDeleteNews(UUID id) {
        moduleService.softDeleteModuleByRowId(id);
    }

    @Transactional
    public News createNewsWithModule(CreateModuleRequest request, User author) {
        Section section = moduleService.getDraftSection(request.sectionId());

        News news = News.builder()
                .moduleId(UUID.randomUUID())
                .variant(NewsVariants.LAST3)
                .contents(new ArrayList<>())
                .section(section)
                .name(request.name())
                .title(request.name())
                .type("NEWS")
                .sortOrder(0)
                .isVisible(false)
                .status(PublishingStatus.DRAFT)
                .author(author)
                .version(1)
                .description("News description")
                .build();

        return newsRepository.save(news);
    }

    /**
     * Updates the DRAFT of the news module in place (no new row).
     */
    @Transactional
    public News createNewsVersion(UpdateNewsRequest request, User author) {
        News news = newsRepository.findByModuleIdAndStatus(request.moduleId(), PublishingStatus.DRAFT)
                .orElseThrow(() -> new RuntimeException("Draft news not found for moduleId: " + request.moduleId()));

        if (request.name() != null) news.setName(request.name());
        if (request.title() != null) news.setTitle(request.title());
        if (request.variant() != null) news.setVariant(request.variant());
        news.setAuthor(author);

        return moduleService.saveDraft(news);
    }
}
