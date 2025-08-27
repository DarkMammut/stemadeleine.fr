package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.PageDto;
import com.stemadeleine.api.dto.PageEditDto;
import com.stemadeleine.api.dto.PageSectionDto;
import com.stemadeleine.api.mapper.PageEditMapper;
import com.stemadeleine.api.mapper.PageMapper;
import com.stemadeleine.api.mapper.PageSectionMapper;
import com.stemadeleine.api.model.CustomUserDetails;
import com.stemadeleine.api.model.Page;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.service.PageService;
import com.stemadeleine.api.service.PageTreeBuilder;
import com.stemadeleine.api.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/pages")
public class PageController {

    private final PageService pageService;
    private final PageTreeBuilder pageTreeBuilder;
    private final PageEditMapper pageEditMapper;
    private final PageSectionMapper pageSectionMapper;
    private final UserService userService;

    public PageController(PageService pageService, PageTreeBuilder pageTreeBuilder, PageEditMapper pageEditMapper, PageSectionMapper pageSectionMapper, UserService userService) {
        this.pageService = pageService;
        this.pageTreeBuilder = pageTreeBuilder;
        this.pageEditMapper = pageEditMapper;
        this.pageSectionMapper = pageSectionMapper;
        this.userService = userService;
    }

    public static class CreatePageRequest {
        public String name;
        public UUID parentPageId; // optional
    }

    // ----- GET -----
    @GetMapping
    public List<Page> getAllPages() {
        return pageService.getAllPages();
    }

    @GetMapping("/tree")
    public List<PageDto> getPageTree() {
        return pageTreeBuilder.buildTree(
                pageService.getLatestPagesForTree()
        );
    }

    @PutMapping("/tree")
    public ResponseEntity<Void> updatePageTree(@RequestBody List<PageDto> tree) {
        pageService.updatePageTree(tree, null);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{pageId}")
    public ResponseEntity<PageEditDto> getPageForEdit(@PathVariable UUID pageId) {
        return pageService.getLastVersion(pageId)
                .map(page -> ResponseEntity.ok(pageEditMapper.toDto(page)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{pageId}/sections")
    public ResponseEntity<PageSectionDto> getPageWithSections(@PathVariable UUID pageId) {
        return pageService.getLastVersion(pageId)
                .map(page -> ResponseEntity.ok(pageSectionMapper.toDto(page)))
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
    public ResponseEntity<PageDto> createNewPage(
            @RequestBody CreatePageRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = currentUserDetails.account().getUser();

        Page parentPage = null;
        if (request.parentPageId != null) {
            parentPage = pageService.getPageById(request.parentPageId);
        }

        Page newPage = pageService.createNewPage(request.name, currentUser, parentPage);

        return ResponseEntity.ok(PageMapper.toDto(newPage));
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

    // ----- ADD BANNER MEDIA -----
    @PutMapping("/{pageId}/hero-media")
    public ResponseEntity<Page> updateHeroMedia(
            @PathVariable UUID pageId,
            @RequestBody Map<String, UUID> body
    ) {
        UUID heroMediaId = body.get("heroMediaId");
        try {
            Page updatedPage = pageService.setHeroMediaLastVersion(pageId, heroMediaId);
            return ResponseEntity.ok(updatedPage);
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