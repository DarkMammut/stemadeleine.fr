package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.PageDto;
import com.stemadeleine.api.dto.PageEditDto;
import com.stemadeleine.api.dto.PageRequest;
import com.stemadeleine.api.dto.PageSectionDto;
import com.stemadeleine.api.mapper.PageEditMapper;
import com.stemadeleine.api.mapper.PageMapper;
import com.stemadeleine.api.mapper.PageSectionMapper;
import com.stemadeleine.api.model.CustomUserDetails;
import com.stemadeleine.api.model.Page;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.service.PageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/pages")
@RequiredArgsConstructor
public class PageController {
    private final PageService pageService;
    private final PageMapper pageMapper;
    private final PageEditMapper pageEditMapper;
    private final PageSectionMapper pageSectionMapper;

    // ----- GET -----
    @GetMapping
    public List<PageDto> getAllPages() {
        log.info("GET /api/pages - Retrieving all pages");
        List<Page> pages = pageService.getAllPages();
        log.debug("Number of pages found: {}", pages.size());
        return pageMapper.toDtoList(pages);
    }

    @GetMapping("/tree")
    public List<PageDto> getPageTree() {
        log.info("GET /api/pages/tree - Retrieving page tree");
        List<Page> pages = pageService.getLatestPagesForTree();
        log.debug("Number of pages in tree: {}", pages.size());
        return pageMapper.toDtoList(pages);
    }

    // Specific routes BEFORE generic routes to avoid conflicts
    @GetMapping("/slug/{slug}")
    public ResponseEntity<PageDto> getPageBySlug(@PathVariable String slug) {
        log.info("GET /api/pages/slug/{} - Retrieving page by slug", slug);
        return pageService.getPublishedPageBySlug(slug)
                .map(page -> {
                    log.debug("Page found by slug: {}", page.getId());
                    return ResponseEntity.ok(pageMapper.toDto(page));
                })
                .orElseGet(() -> {
                    log.warn("Page not found with slug: {}", slug);
                    return ResponseEntity.notFound().build();
                });
    }

    @GetMapping("/{pageId}")
    public ResponseEntity<PageEditDto> getPage(@PathVariable UUID pageId) {
        log.info("GET /api/pages/{} - Retrieving page by ID", pageId);
        return pageService.getLastVersion(pageId)
                .map(page -> {
                    log.debug("Page found: {}", page.getId());
                    return ResponseEntity.ok(pageEditMapper.toDto(page));
                })
                .orElseGet(() -> {
                    log.warn("Page not found with ID: {}", pageId);
                    return ResponseEntity.notFound().build();
                });
    }

    @GetMapping("/{pageId}/sections")
    public ResponseEntity<PageSectionDto> getPageWithSections(@PathVariable UUID pageId) {
        log.info("GET /api/pages/{}/sections - Retrieving page with sections", pageId);
        return pageService.getLastVersion(pageId)
                .map(page -> {
                    log.debug("Page with sections found: {}", page.getId());
                    // Retrieve filtered sections (without deleted ones) via service
                    PageSectionDto dto = pageSectionMapper.toDto(page);
                    return ResponseEntity.ok(dto);
                })
                .orElseGet(() -> {
                    log.warn("Page not found with ID: {}", pageId);
                    return ResponseEntity.notFound().build();
                });
    }

    // ----- CREATE NEW PAGE (simplified logic like sections) -----
    @PostMapping
    public ResponseEntity<PageDto> createPage(
            @Valid @RequestBody PageRequest request,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        if (customUserDetails == null) {
            log.error("Attempt to create page without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = customUserDetails.account().getUser();

        if (request.isNewPage()) {
            log.info("POST /api/pages - Creating new page");
            Page page = pageService.createNewPage(request.parentPageId(), request.name(), currentUser);
            log.debug("Page created successfully: {}", page.getId());
            return ResponseEntity.ok(pageMapper.toDto(page));
        } else {
            log.error("Attempt to create page with existing pageId - use PUT instead");
            throw new RuntimeException("Use PUT for updating existing pages");
        }
    }

    // ----- UPDATE PAGE (simplified logic like sections) -----
    @PutMapping("/{pageId}")
    public ResponseEntity<PageDto> updatePage(
            @PathVariable UUID pageId,
            @Valid @RequestBody PageRequest request,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        if (customUserDetails == null) {
            log.error("Attempt to update page without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = customUserDetails.account().getUser();
        log.info("PUT /api/pages/{} - Updating basic page info", pageId);

        Page page = pageService.updatePage(
                pageId,
                request.name(),
                request.title(),
                request.subTitle(),
                request.slug(),
                request.description(),
                request.isVisible(),
                currentUser
        );

        log.debug("Page updated successfully: {}", page.getId());
        return ResponseEntity.ok(pageMapper.toDto(page));
    }

    // ----- UPDATE PAGE TREE ORDER -----
    @PutMapping("/tree")
    public ResponseEntity<Void> updatePageTree(
            @RequestBody List<PageDto> tree,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        if (customUserDetails == null) {
            log.error("Attempt to update page tree without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = customUserDetails.account().getUser();
        log.info("PUT /api/pages/tree - Updating page tree order by user ID: {}", currentUser.getId());

        try {
            pageService.updatePageTree(tree, null);
            log.debug("Page tree updated successfully");
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error updating page tree: {}", e.getMessage());
            throw new RuntimeException("Error updating page tree", e);
        }
    }

    // ----- ADD BANNER MEDIA (unchanged) -----
    @PutMapping("/{pageId}/hero-media")
    public ResponseEntity<PageDto> updateHeroMedia(
            @PathVariable UUID pageId,
            @RequestBody Map<String, UUID> body
    ) {
        UUID heroMediaId = body.get("heroMediaId");
        try {
            Page updatedPage = pageService.setHeroMediaLastVersion(pageId, heroMediaId);
            log.debug("Hero media updated for page: {}", pageId);
            return ResponseEntity.ok(pageMapper.toDto(updatedPage));
        } catch (RuntimeException e) {
            log.error("Error updating hero media: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // ----- REMOVE BANNER MEDIA -----
    @DeleteMapping("/{pageId}/hero-media")
    public ResponseEntity<PageDto> removeHeroMedia(@PathVariable UUID pageId) {
        log.info("DELETE /api/pages/{}/hero-media - Removing hero media", pageId);
        try {
            Page updatedPage = pageService.removeHeroMediaLastVersion(pageId);
            log.debug("Hero media removed for page: {}", pageId);
            return ResponseEntity.ok(pageMapper.toDto(updatedPage));
        } catch (RuntimeException e) {
            log.error("Error removing hero media: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // ----- UPDATE VISIBILITY (dedicated route) -----
    @PutMapping("/{pageId}/visibility")
    public ResponseEntity<PageDto> updateVisibility(
            @PathVariable UUID pageId,
            @RequestBody Boolean isVisible,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        if (customUserDetails == null) {
            log.error("Attempt to update visibility without authentication");
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = customUserDetails.account().getUser();
        log.info("PUT /api/pages/{}/visibility - Updating visibility: {}", pageId, isVisible);

        try {
            Page page = pageService.updatePageVisibility(pageId, isVisible, currentUser);
            log.debug("Visibility updated for page: {}", pageId);
            return ResponseEntity.ok(pageMapper.toDto(page));
        } catch (RuntimeException e) {
            log.error("Error updating visibility: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // ----- DELETE (simplified logic) -----
    @DeleteMapping("/{pageId}")
    public ResponseEntity<Void> deletePage(@PathVariable UUID pageId) {
        log.info("DELETE /api/pages/{} - Logical page deletion", pageId);
        pageService.delete(pageId);
        log.debug("Page deleted: {}", pageId);
        return ResponseEntity.noContent().build();
    }
}