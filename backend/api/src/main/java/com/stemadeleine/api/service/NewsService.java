package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateModuleRequest;
import com.stemadeleine.api.dto.UpdateNewsPutRequest;
import com.stemadeleine.api.dto.UpdateNewsRequest;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.repository.NewsRepository;
import com.stemadeleine.api.repository.SectionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

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

    private final NewsRepository newsRepository;
    private final ModuleService moduleService;
    private final SectionRepository sectionRepository;
    private final PageService pageService;
    private final SectionService sectionService;

    public List<News> getAllNews() {
        log.info("Récupération de toutes les actualités non supprimées");
        List<News> news = newsRepository.findByStatusNot(PublishingStatus.DELETED);
        log.debug("Nombre d'actualités trouvées : {}", news.size());
        return news;
    }

    public Optional<News> getNewsById(UUID id) {
        log.info("Recherche de l'actualité avec l'ID : {}", id);
        Optional<News> news = newsRepository.findById(id)
                .filter(n -> n.getStatus() != PublishingStatus.DELETED);
        log.debug("Actualité trouvée : {}", news.isPresent());
        return news;
    }

    public Optional<News> getLastVersionByModuleId(UUID moduleId) {
        log.info("Recherche de la dernière version de l'actualité avec le moduleId : {}", moduleId);
        Optional<News> news = newsRepository.findTopByModuleIdOrderByVersionDesc(moduleId)
                .filter(n -> n.getStatus() != PublishingStatus.DELETED);
        log.debug("Actualité trouvée : {}", news.isPresent());
        return news;
    }

    public boolean existsNewsWithVariantAll() {
        log.info("Vérification de l'existence d'une actualité avec la variante ALL");
        boolean exists = newsRepository.existsByVariantAndStatusNot(NewsVariants.ALL, PublishingStatus.DELETED);
        log.debug("Actualité avec variante ALL existe : {}", exists);
        return exists;
    }

    @Transactional
    public Map<String, UUID> createNewsPagesStructure(User author) {
        log.info("Création de la structure complète pour les pages Actualités avec URL fixe /actualites");

        // 1. Créer la page "Actualités" à la racine (parentPageId = null)
        Page actualitesPage = pageService.createNewPage(null, "Actualités", author);

        // Mettre à jour le slug et publier la page
        actualitesPage = pageService.updatePage(
                actualitesPage.getPageId(),
                "Actualités",
                "Actualités",
                null,
                "/actualites",
                null,
                true,
                author
        );
        log.debug("Page Actualités créée et publiée avec l'ID : {}", actualitesPage.getPageId());

        // 2. Créer une section dans cette page
        Section section = sectionService.createNewSection(actualitesPage.getPageId(), "Section Actualités", author);
        section = sectionService.updateSection(section.getSectionId(), "Section Actualités", "Section Actualités", true, author);
        log.debug("Section créée et publiée avec l'ID : {}", section.getSectionId());

        // 3. Créer la page enfant dynamique [newsId]
        Page detailPage = pageService.createNewPage(actualitesPage.getPageId(), "[newsId]", author);
        detailPage = pageService.updatePage(
                detailPage.getPageId(),
                "[newsId]",
                "[newsId]",
                null,
                "/[newsId]",
                null,
                false, // Invisible dans la navigation (route dynamique)
                author
        );
        log.debug("Page détail créée et publiée (invisible) avec l'ID : {}", detailPage.getPageId());

        // 4. URL de détail toujours fixée à /actualites
        String detailPageUrl = "/actualites";
        log.debug("URL de base pour les détails : {}", detailPageUrl);

        // 5. Créer le module News avec variante ALL
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
                .status(PublishingStatus.PUBLISHED)
                .author(author)
                .version(1)
                .description("Module pour afficher toutes les actualités")
                .detailPageUrl(detailPageUrl)
                .build();

        News savedNews = newsRepository.save(news);
        log.debug("Module News créé et publié avec l'ID : {}, URL de détail : {}", savedNews.getModuleId(), detailPageUrl);

        // 6. Mettre à jour tous les modules News existants (non supprimés) avec l'URL /actualites
        log.info("Mise à jour de tous les modules News existants avec l'URL : {}", detailPageUrl);
        List<News> existingNewsList = newsRepository.findByStatusNot(PublishingStatus.DELETED);
        int updatedCount = 0;

        for (News existingNews : existingNewsList) {
            if (!existingNews.getId().equals(savedNews.getId())) {
                existingNews.setDetailPageUrl(detailPageUrl);
                newsRepository.save(existingNews);
                updatedCount++;
            }
        }

        log.info("Mise à jour terminée : {} module(s) News mis à jour avec l'URL {}", updatedCount, detailPageUrl);
        log.info("Structure Actualités créée avec succès");

        Map<String, UUID> result = new HashMap<>();
        result.put("actualitesPageId", actualitesPage.getPageId());
        result.put("detailPageId", detailPage.getPageId());
        result.put("sectionId", section.getSectionId());
        result.put("newsModuleId", savedNews.getModuleId());

        return result;
    }

    public News updateNews(UUID id, UpdateNewsPutRequest request) {
        log.info("Mise à jour de l'actualité avec l'ID : {}", id);
        return newsRepository.findById(id)
                .map(news -> {
                    if (request.getTitle() != null) {
                        news.setTitle(request.getTitle());
                    }
                    if (request.getName() != null) {
                        news.setName(request.getName());
                    }
                    if (request.getSortOrder() != null) {
                        news.setSortOrder(request.getSortOrder());
                    }
                    if (request.getVariant() != null) {
                        news.setVariant(request.getVariant());
                    }
                    log.debug("Actualité mise à jour : {}", news);
                    return newsRepository.save(news);
                })
                .orElseThrow(() -> {
                    log.error("Actualité non trouvée avec l'ID : {}", id);
                    return new RuntimeException("News not found");
                });
    }

    public void softDeleteNews(UUID id) {
        log.info("Suppression logique de l'actualité avec l'ID : {}", id);
        newsRepository.findById(id).ifPresent(news -> {
            news.setStatus(PublishingStatus.DELETED);
            newsRepository.save(news);
            log.debug("Actualité marquée comme supprimée : {}", id);
        });
    }

    public News createNewsWithModule(CreateModuleRequest request, User author) {
        log.info("Création d'une nouvelle actualité pour la section : {}", request.sectionId());

        // Récupérer la section à partir de l'UUID
        Section section = sectionRepository.findTopBySectionIdOrderByVersionDesc(request.sectionId())
                .orElseThrow(() -> new RuntimeException("Section not found for id: " + request.sectionId()));

        // Créer directement la news (hérite de Module)
        News news = News.builder()
                .moduleId(UUID.randomUUID())
                .variant(NewsVariants.LAST3)
                .contents(new java.util.ArrayList<>())
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

        News savedNews = newsRepository.save(news);
        log.info("Actualité créée avec succès, ID : {}", savedNews.getId());
        return savedNews;
    }

    public News createNewsVersion(UpdateNewsRequest request, User author) {
        log.info("Création d'une nouvelle version de news pour le moduleId : {}", request.moduleId());

        // 1. Récupérer le module
        Module module = moduleService.getModuleByModuleId(request.moduleId())
                .orElseThrow(() -> new RuntimeException("Module not found for id: " + request.moduleId()));

        // 2. Récupérer la dernière version de la news pour ce module
        News previousNews = newsRepository.findTopByModuleIdOrderByVersionDesc(request.moduleId())
                .orElse(null);

        // 3. Fusionner les infos du request et de la version précédente
        String name = request.name() != null ? request.name() : (previousNews != null ? previousNews.getName() : module.getName());
        String title = request.title() != null ? request.title() : (previousNews != null ? previousNews.getTitle() : module.getTitle());
        NewsVariants variant = request.variant() != null ? request.variant() : (previousNews != null ? previousNews.getVariant() : NewsVariants.LAST3);
        List<Content> contents = previousNews != null ? new ArrayList<>(previousNews.getContents()) : new ArrayList<>();
        String type = module.getType();
        Integer sortOrder = module.getSortOrder();
        Boolean isVisible = module.getIsVisible();
        PublishingStatus status = PublishingStatus.DRAFT;
        int newVersion = previousNews != null ? previousNews.getVersion() + 1 : 1;

        News news = News.builder()
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
                .build();

        News savedNews = newsRepository.save(news);
        log.info("Nouvelle version de news créée avec succès, ID : {}", savedNews.getId());
        return savedNews;
    }
}
