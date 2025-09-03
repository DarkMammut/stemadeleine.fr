package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateNewsRequest;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.repository.ContentRepository;
import com.stemadeleine.api.repository.NewsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NewsService {

    private final NewsRepository newsRepository;
    private final ModuleService moduleService;
    private final ContentRepository contentRepository;

    public List<News> getAllNews() {
        return newsRepository.findByStatusNot(PublishingStatus.DELETED);
    }

    public Optional<News> getNewsById(UUID id) {
        return newsRepository.findById(id)
                .filter(news -> news.getStatus() != PublishingStatus.DELETED);
    }

    public News updateNews(UUID id, News details) {
        return newsRepository.findById(id)
                .map(news -> {
                    news.setDescription(details.getDescription());
                    news.setIsVisible(details.getIsVisible());
                    news.setStartDate(details.getStartDate());
                    news.setEndDate(details.getEndDate());
                    news.setVariant(details.getVariant());
                    news.setMedia(details.getMedia());
                    return newsRepository.save(news);
                })
                .orElseThrow(() -> new RuntimeException("News not found"));
    }

    public void softDeleteNews(UUID id) {
        newsRepository.findById(id).ifPresent(news -> {
            news.setStatus(PublishingStatus.DELETED);
            newsRepository.save(news);
        });
    }

    public News createNewsWithModule(CreateNewsRequest request, User author) {
        // Utilisation explicite du Module du projet
        Module module = moduleService.createNewModule(
                request.sectionId(),
                request.name(),
                "NEWS",
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

        // Créer la newsletter et la lier au module
        News news = News.builder()
                .variant(NewsVariants.LAST3)
                .contents(List.of(content))
                .build();
        return newsRepository.save(news);
    }
}
