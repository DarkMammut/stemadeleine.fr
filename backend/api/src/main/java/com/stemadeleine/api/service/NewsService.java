package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateNewsRequest;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.repository.ContentRepository;
import com.stemadeleine.api.repository.NewsRepository;
import com.stemadeleine.api.utils.JsonUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsService {

    private final NewsRepository newsRepository;
    private final ModuleService moduleService;
    private final ContentRepository contentRepository;

    public List<News> getAllNews() {
        log.info("Récupération de toutes les actualités non supprimées");
        List<News> newsList = newsRepository.findByStatusNot(PublishingStatus.DELETED);
        log.debug("Nombre d'actualités trouvées : {}", newsList.size());
        return newsList;
    }

    public Optional<News> getNewsById(UUID id) {
        log.info("Recherche de l'actualité avec l'ID : {}", id);
        Optional<News> news = newsRepository.findById(id)
                .filter(n -> n.getStatus() != PublishingStatus.DELETED);
        log.debug("Actualité trouvée : {}", news.isPresent());
        return news;
    }

    public News updateNews(UUID id, News details) {
        log.info("Mise à jour de l'actualité avec l'ID : {}", id);
        return newsRepository.findById(id)
                .map(news -> {
                    news.setDescription(details.getDescription());
                    news.setIsVisible(details.getIsVisible());
                    news.setStartDate(details.getStartDate());
                    news.setEndDate(details.getEndDate());
                    news.setVariant(details.getVariant());
                    news.setMedia(details.getMedia());
                    news.setContents(details.getContents());
                    news.setName(details.getName());
                    news.setTitle(details.getTitle());
                    news.setSortOrder(details.getSortOrder());
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

    public News createNewsWithModule(CreateNewsRequest request, User author) {
        log.info("Création d'une nouvelle actualité pour la section : {}", request.sectionId());

        Module module = moduleService.createNewModule(
                request.sectionId(),
                request.name(),
                "NEWS",
                author
        );
        log.debug("Module créé avec l'ID : {}", module.getId());

        Content content = Content.builder()
                .ownerId(module.getId())
                .version(1)
                .status(PublishingStatus.DRAFT)
                .isVisible(false)
                .title(request.name())
                .body(JsonUtils.createEmptyJsonNode())
                .build();
        Content savedContent = contentRepository.save(content);
        log.debug("Contenu créé avec l'ID : {}", savedContent.getId());

        OffsetDateTime now = OffsetDateTime.now();
        News news = News.builder()
                .variant(NewsVariants.LAST3)
                .contents(List.of(savedContent))
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
                .startDate(now)
                .endDate(now.plusMonths(1))
                .description("Nouvelle actualité")
                .build();

        News savedNews = newsRepository.save(news);
        log.info("Actualité créée avec succès, ID : {}", savedNews.getId());
        return savedNews;
    }
}
