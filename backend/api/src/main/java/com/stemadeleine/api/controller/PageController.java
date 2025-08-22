package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.PageDto;
import com.stemadeleine.api.model.Page;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.service.PageService;
import com.stemadeleine.api.service.PageTreeBuilder;
import com.stemadeleine.api.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pages")
public class PageController {

    private final PageService pageService;
    private final PageTreeBuilder pageTreeBuilder;
    private final UserService userService;

    public PageController(PageService pageService, PageTreeBuilder pageTreeBuilder, UserService userService) {
        this.pageService = pageService;
        this.pageTreeBuilder = pageTreeBuilder;
        this.userService = userService;
    }

    public static class CreatePageRequest {
        public String name;
        public UUID parentPageId; // optionnel
    }

    // ----- GET -----
    @GetMapping
    public List<Page> getAllPages() {
        return pageService.getAllPages();
    }

    @GetMapping("/tree")
    public List<PageDto> getPageTree() {
        return pageTreeBuilder.buildTree(
                pageService.getAllPages().stream()
                        .filter(Page::getIsVisible)
                        .toList()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Page> getPageById(@PathVariable UUID id) {
        return pageService.getLastVersion(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<Page> getPageBySlug(@PathVariable String slug) {
        return pageService.getPublishedPageBySlug(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ----- CREATE NEW PAGE -----
    @PostMapping
    public ResponseEntity<Page> createNewPage(
            @RequestBody CreatePageRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        Page parentPage = null;

        if (request.parentPageId != null) {
            parentPage = pageService.getPageById(request.parentPageId);
        }

        Page newPage = pageService.createNewPage(request.name, currentUser, parentPage);
        return ResponseEntity.ok(newPage);
    }


    // ----- CREATE DRAFT -----
    @PostMapping("/draft")
    public ResponseEntity<Page> createDraft(@RequestBody Page page) {
        return ResponseEntity.ok(pageService.createDraft(page));
    }

    // ----- UPDATE DRAFT -----
    @PutMapping("/{id}")
    public ResponseEntity<Page> updateDraft(@PathVariable UUID id, @RequestBody Page updatedPage) {
        return pageService.updateDraft(id, updatedPage)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ----- PUBLISH -----
    @PostMapping("/publish/{draftId}")
    public ResponseEntity<Page> publishDraft(@PathVariable UUID draftId) {
        try {
            Page published = pageService.publishPage(draftId);
            return ResponseEntity.ok(published);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ----- DELETE -----
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        pageService.delete(id);
        return ResponseEntity.noContent().build();
    }
}