package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.PageDto;
import com.stemadeleine.api.model.Media;
import com.stemadeleine.api.model.Page;
import com.stemadeleine.api.model.PageStatus;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.MediaRepository;
import com.stemadeleine.api.repository.PageRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.function.BinaryOperator;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PageService {

    private final MediaRepository mediaRepository;
    private final PageRepository pageRepository;

    public Optional<Page> getPublishedPage(UUID pageId) {
        return pageRepository.findTopByPageIdAndStatusOrderByVersionDesc(pageId, PageStatus.PUBLISHED);
    }

    public Optional<Page> getPublishedPageBySlug(String slug) {
        return pageRepository.findBySlug(slug)
                .filter(Page::getIsVisible);
    }

    public Optional<Page> getLastVersion(UUID pageId) {
        return pageRepository.findTopByPageIdOrderByVersionDesc(pageId);
    }

    public List<Page> getLatestPagesForTree() {
        return pageRepository.findAll().stream()
                .filter(p -> !Boolean.TRUE.equals(p.getIsDeleted()))
                .collect(Collectors.toMap(Page::getPageId, Function.identity(), BinaryOperator.maxBy(Comparator.comparingInt(Page::getVersion))))
                .values()
                .stream()
                .toList();
    }

    public Page getPageById(UUID pageId) {
        return pageRepository.findById(pageId)
                .orElseThrow(() -> new RuntimeException("Page not found with id: " + pageId));
    }

    public Page createDraft(Page page) {
        int nextVersion = pageRepository.findMaxVersionByPageId(page.getPageId())
                .orElse(0) + 1;
        page.setId(null);
        page.setVersion(nextVersion);
        page.setStatus(PageStatus.DRAFT);
        return pageRepository.save(page);
    }

    @Transactional
    public Page publishPage(UUID draftId) {
        Page draft = pageRepository.findById(draftId)
                .orElseThrow(() -> new RuntimeException("Draft not found"));

        pageRepository.findTopByPageIdAndStatusOrderByVersionDesc(draft.getPageId(), PageStatus.PUBLISHED)
                .ifPresent(p -> {
                    p.setStatus(PageStatus.ARCHIVED);
                    p.setIsVisible(false);
                    pageRepository.save(p);
                });

        draft.setStatus(PageStatus.PUBLISHED);
        draft.setIsVisible(true);

        return pageRepository.save(draft);
    }

    public List<Page> getAllPages() {
        return pageRepository.findAll();
    }

    @Transactional
    public void updatePageTree(List<PageDto> tree, Page parent) {
        int sortOrder = 0;

        for (PageDto dto : tree) {
            Page page = pageRepository.findById(dto.id())
                    .orElseThrow(() -> new RuntimeException("Page non trouvée : " + dto.id()));

            page.setParentPage(parent);
            page.setSortOrder(sortOrder++);
            page.setIsVisible(dto.isVisible());

            if (dto.status() != null) {
                page.setStatus(dto.status());
            }

            pageRepository.save(page);

            if (dto.children() != null && !dto.children().isEmpty()) {
                updatePageTree(dto.children(), page);
            }
        }
    }

    public Optional<Page> updateDraft(UUID id, Page updatedPage) {
        return pageRepository.findById(id)
                .map(existing -> {
                    if (existing.getIsVisible()) {
                        Page draft = Page.builder()
                                .pageId(existing.getPageId())
                                .version(pageRepository.findMaxVersionByPageId(existing.getPageId()).orElse(0) + 1)
                                .name(updatedPage.getName())
                                .title(updatedPage.getTitle())
                                .subTitle(updatedPage.getSubTitle())
                                .description(updatedPage.getDescription())
                                .slug(existing.getSlug())
                                .status(updatedPage.getStatus())
                                .sortOrder(updatedPage.getSortOrder())
                                .parentPage(updatedPage.getParentPage())
                                .heroMedia(updatedPage.getHeroMedia())
                                .author(updatedPage.getAuthor())
                                .isVisible(false)
                                .isDeleted(false)
                                .build();
                        return pageRepository.save(draft);
                    } else {
                        existing.setName(updatedPage.getName());
                        existing.setTitle(updatedPage.getTitle());
                        existing.setSubTitle(updatedPage.getSubTitle());
                        existing.setDescription(updatedPage.getDescription());
                        existing.setStatus(updatedPage.getStatus());
                        existing.setSortOrder(updatedPage.getSortOrder());
                        existing.setParentPage(updatedPage.getParentPage());
                        existing.setHeroMedia(updatedPage.getHeroMedia());
                        existing.setAuthor(updatedPage.getAuthor());
                        return pageRepository.save(existing);
                    }
                });
    }

    public Page createNewPage(String name, User author, Page parentPage) {
        Integer maxSortOrder = pageRepository.findMaxSortOrderByParent(parentPage != null ? parentPage.getId() : null);
        if (maxSortOrder == null) {
            maxSortOrder = 0;
        }

        String slug = name.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");

        return pageRepository.save(Page.builder()
                .pageId(UUID.randomUUID())
                .version(1)
                .name(name)
                .title(name)
                .slug(slug)
                .sortOrder(maxSortOrder + 1)
                .parentPage(parentPage)
                .author(author)
                .status(PageStatus.DRAFT)
                .isVisible(false)
                .isDeleted(false)
                .build());
    }

    public Page setHeroMediaLastVersion(UUID pageId, UUID heroMediaId) {
        Page lastVersion = pageRepository.findTopByPageIdOrderByVersionDesc(pageId)
                .orElseThrow(() -> new RuntimeException("Page not found"));

        Media media = mediaRepository.findById(heroMediaId)
                .orElseThrow(() -> new RuntimeException("Media not found"));

        lastVersion.setHeroMedia(media);
        return pageRepository.save(lastVersion);
    }

    @Transactional
    public void delete(UUID id) {
        pageRepository.softDeleteById(id);
    }
}
