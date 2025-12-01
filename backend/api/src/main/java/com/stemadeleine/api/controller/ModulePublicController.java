package com.stemadeleine.api.controller;


import com.stemadeleine.api.dto.ArticleDto;
import com.stemadeleine.api.dto.GalleryDto;
import com.stemadeleine.api.mapper.ArticleMapper;
import com.stemadeleine.api.mapper.GalleryMapper;
import com.stemadeleine.api.service.ArticleService;
import com.stemadeleine.api.service.GalleryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/public/modules")
@CrossOrigin(origins = {"http://localhost:3000", "https://stemadeleine.fr"})
@RequiredArgsConstructor
public class ModulePublicController {

    private final ArticleService articleService;
    private final ArticleMapper articleMapper;
    private final GalleryService galleryService;
    private final GalleryMapper galleryMapper;

    @GetMapping("article/by-module-id/{moduleId}")
    public ResponseEntity<ArticleDto> getArticleByModuleId(@PathVariable UUID moduleId) {
        log.info("GET /api/public/modules/article/by-module-id/{} - Retrieving latest article version by moduleId", moduleId);
        return articleService.getLastVersionByModuleId(moduleId)
                .map(article -> {
                    log.debug("Article found: {} (version {})", article.getId(), article.getVersion());
                    return ResponseEntity.ok(articleMapper.toDto(article));
                })
                .orElseGet(() -> {
                    log.warn("Article not found with moduleId: {}", moduleId);
                    return ResponseEntity.notFound().build();
                });
    }

    @GetMapping("gallery/by-module-id/{moduleId}")
    public ResponseEntity<GalleryDto> getGalleryByModuleId(@PathVariable UUID moduleId) {
        log.info("GET /api/galleries/by-module-id/{} - Retrieving latest gallery version by moduleId", moduleId);
        return galleryService.getLastVersionByModuleId(moduleId)
                .map(gallery -> {
                    log.debug("Gallery found: {} (version {})", gallery.getId(), gallery.getVersion());
                    return ResponseEntity.ok(galleryMapper.toDto(gallery));
                })
                .orElseGet(() -> {
                    log.warn("Gallery not found with moduleId: {}", moduleId);
                    return ResponseEntity.notFound().build();
                });
    }
}
