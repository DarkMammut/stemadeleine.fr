package com.stemadeleine.api.controller;

import com.stemadeleine.api.model.Page;
import com.stemadeleine.api.service.PageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pages")
public class PageController {

    private final PageService pageService;

    public PageController(PageService pageService) {
        this.pageService = pageService;
    }

    @GetMapping
    public List<Page> getAllPages() {
        return pageService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Page> getPageById(@PathVariable UUID id) {
        return pageService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<Page> getPageBySlug(@PathVariable String slug) {
        return pageService.findBySlug(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Page> createPage(@RequestBody Page page) {
        return ResponseEntity.ok(pageService.save(page));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Page> updatePage(@PathVariable UUID id, @RequestBody Page updatedPage) {
        return pageService.findById(id)
                .map(page -> {
                    page.setTitle(updatedPage.getTitle());
                    page.setSubTitle(updatedPage.getSubTitle());
                    page.setDescription(updatedPage.getDescription());
                    page.setNavPosition(updatedPage.getNavPosition());
                    page.setSortOrder(updatedPage.getSortOrder());
                    page.setParentPage(updatedPage.getParentPage());
                    page.setHeroMedia(updatedPage.getHeroMedia());
                    page.setIsVisible(updatedPage.getIsVisible());
                    return ResponseEntity.ok(pageService.save(page));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        pageService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
