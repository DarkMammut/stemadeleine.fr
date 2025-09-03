package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.CreateNewsRequest;
import com.stemadeleine.api.dto.NewsDto;
import com.stemadeleine.api.mapper.NewsMapper;
import com.stemadeleine.api.model.CustomUserDetails;
import com.stemadeleine.api.model.News;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.service.NewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;
    private final NewsMapper newsMapper;

    @GetMapping
    public List<NewsDto> getAllNews() {
        return newsService.getAllNews().stream().map(newsMapper::toDto).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<NewsDto> getById(@PathVariable UUID id) {
        return newsService.getNewsById(id)
                .map(newsMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<NewsDto> createNewsWithModule(@RequestBody CreateNewsRequest request, @AuthenticationPrincipal CustomUserDetails currentUserDetails) {
        if (currentUserDetails == null) {
            throw new RuntimeException("User not authenticated");
        }
        User currentUser = currentUserDetails.account().getUser();
        News news = newsService.createNewsWithModule(request, currentUser);
        return ResponseEntity.ok(newsMapper.toDto(news));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NewsDto> update(@PathVariable UUID id, @RequestBody News news) {
        try {
            News updated = newsService.updateNews(id, news);
            return ResponseEntity.ok(newsMapper.toDto(updated));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        newsService.softDeleteNews(id);
        return ResponseEntity.noContent().build();
    }
}
