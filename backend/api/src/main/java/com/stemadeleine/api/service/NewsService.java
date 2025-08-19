package com.stemadeleine.api.service;

import com.stemadeleine.api.model.News;
import com.stemadeleine.api.repository.NewsRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class NewsService {

    private final NewsRepository newsRepository;

    public NewsService(NewsRepository newsRepository) {
        this.newsRepository = newsRepository;
    }

    public List<News> findAll() {
        return newsRepository.findAll();
    }

    public Optional<News> findById(UUID id) {
        return newsRepository.findById(id);
    }

    public List<News> findVisible() {
        return newsRepository.findByIsVisibleTrueOrderByDateDesc();
    }

    public News save(News news) {
        return newsRepository.save(news);
    }

    public News update(UUID id, News details) {
        return newsRepository.findById(id)
                .map(news -> {
                    news.setTitle(details.getTitle());
                    news.setDescription(details.getDescription());
                    news.setIsVisible(details.getIsVisible());
                    news.setDate(details.getDate());
                    return newsRepository.save(news);
                })
                .orElseThrow(() -> new RuntimeException("News not found with id " + id));
    }

    public void delete(UUID id) {
        newsRepository.deleteById(id);
    }
}
