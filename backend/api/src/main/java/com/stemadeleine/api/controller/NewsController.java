package com.stemadeleine.api.controller;

import com.stemadeleine.api.model.News;
import com.stemadeleine.api.service.NewsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/news")
public class NewsController {

    private final NewsService newsService;

    public NewsController(NewsService newsService) {
        this.newsService = newsService;
    }

    @GetMapping
    public List<News> getAll() {
        return newsService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<News> getById(@PathVariable UUID id) {
        return newsService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/visible")
    public List<News> getVisible() {
        return newsService.findVisible();
    }

    @PostMapping
    public News create(@RequestBody News news) {
        return newsService.save(news);
    }

    @PutMapping("/{id}")
    public ResponseEntity<News> update(@PathVariable UUID id, @RequestBody News news) {
        try {
            return ResponseEntity.ok(newsService.update(id, news));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        newsService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
