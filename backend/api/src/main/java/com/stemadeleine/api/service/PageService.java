package com.stemadeleine.api.service;

import com.stemadeleine.api.model.Page;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.PageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PageService {

    private final PageRepository pageRepository;

    public Optional<Page> getPublishedPage(UUID pageId) {
        return pageRepository.findTopByPageIdAndIsVisibleTrueOrderByVersionDesc(pageId);
    }

    public Optional<Page> getPublishedPageBySlug(String slug) {
        return pageRepository.findBySlug(slug)
                .filter(Page::getIsVisible); // ne retourne que la version publiée
    }

    public Optional<Page> getLastVersion(UUID pageId) {
        return pageRepository.findTopByPageIdOrderByVersionDesc(pageId);
    }

    public Page getPageById(UUID pageId) {
        return pageRepository.findById(pageId)
                .orElseThrow(() -> new RuntimeException("Page not found with id: " + pageId));
    }

    public Page createDraft(Page page) {
        int nextVersion = pageRepository.findMaxVersionByPageId(page.getPageId())
                .orElse(0) + 1;
        page.setVersion(nextVersion);
        page.setIsVisible(false); // draft
        return pageRepository.save(page);
    }

    public Page publishPage(UUID draftId) {
        Page draft = pageRepository.findById(draftId)
                .orElseThrow(() -> new RuntimeException("Draft not found"));

        pageRepository.findTopByPageIdAndIsVisibleTrueOrderByVersionDesc(draft.getPageId())
                .ifPresent(p -> {
                    p.setIsVisible(false);
                    pageRepository.save(p);
                });

        draft.setIsVisible(true);
        return pageRepository.save(draft);
    }

    public List<Page> getAllPages() {
        return pageRepository.findAll();
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
                                .navPosition(updatedPage.getNavPosition())
                                .sortOrder(updatedPage.getSortOrder())
                                .parentPage(updatedPage.getParentPage())
                                .heroMedia(updatedPage.getHeroMedia())
                                .author(updatedPage.getAuthor())
                                .isVisible(false) // draft
                                .build();
                        return pageRepository.save(draft);
                    } else {
                        existing.setName(updatedPage.getName());
                        existing.setTitle(updatedPage.getTitle());
                        existing.setSubTitle(updatedPage.getSubTitle());
                        existing.setDescription(updatedPage.getDescription());
                        existing.setNavPosition(updatedPage.getNavPosition());
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
                .isVisible(false)
                .build());
    }


    public void delete(UUID id) {
        pageRepository.deleteById(id);
    }
}
