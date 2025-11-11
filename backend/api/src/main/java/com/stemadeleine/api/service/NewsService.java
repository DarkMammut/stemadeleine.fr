package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateModuleRequest;
import com.stemadeleine.api.dto.UpdateNewsPutRequest;
import com.stemadeleine.api.dto.UpdateNewsRequest;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.repository.NewsRepository;
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
public class NewsService {

    private final NewsRepository newsRepository;
    private final ModuleService moduleService;
    private final SectionRepository sectionRepository;

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
