package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.PageDto;
import com.stemadeleine.api.model.Media;
import com.stemadeleine.api.model.Page;
import com.stemadeleine.api.model.PublishingStatus;
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
        return pageRepository.findTopByPageIdAndStatusOrderByVersionDesc(pageId, PublishingStatus.PUBLISHED);
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
                .filter(p -> p.getStatus() != PublishingStatus.DELETED)
                .collect(Collectors.toMap(Page::getPageId, Function.identity(), BinaryOperator.maxBy(Comparator.comparingInt(Page::getVersion))))
                .values()
                .stream()
                .sorted(Comparator.comparing(
                        page -> page.getSortOrder() != null ? page.getSortOrder() : 0
                )) // Gérer les sortOrder null en les traitant comme 0
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
        page.setStatus(PublishingStatus.DRAFT);
        return pageRepository.save(page);
    }

    @Transactional
    public Page publishPage(UUID draftId) {
        Page draft = pageRepository.findById(draftId)
                .orElseThrow(() -> new RuntimeException("Draft not found"));

        pageRepository.findTopByPageIdAndStatusOrderByVersionDesc(draft.getPageId(), PublishingStatus.PUBLISHED)
                .ifPresent(p -> {
                    p.setStatus(PublishingStatus.ARCHIVED);
                    p.setIsVisible(false);
                    pageRepository.save(p);
                });

        draft.setStatus(PublishingStatus.PUBLISHED);
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

    public Page createNewPage(UUID parentPageId, String name, User author) {
        Page parentPage = null;
        if (parentPageId != null) {
            parentPage = getLastVersion(parentPageId)
                    .orElseThrow(() -> new RuntimeException("Parent page not found with id: " + parentPageId));
        }

        Integer maxSortOrder = pageRepository.findMaxSortOrderByParentPage(parentPageId);
        if (maxSortOrder == null) {
            maxSortOrder = 0;
        }

        // Générer le slug basé sur le nom et le parent
        String slug = generateSlug(parentPage != null ? parentPage.getSlug() : null, name);

        Page page = Page.builder()
                .pageId(UUID.randomUUID())
                .parentPage(parentPage)
                .version(1)
                .name(name)
                .title(name)
                .slug(slug)
                .sortOrder(maxSortOrder + 1)
                .author(author)
                .status(PublishingStatus.DRAFT)
                .isVisible(false)
                .build();

        return pageRepository.save(page);
    }

    public Page updatePage(UUID pageId, String name, String title, String subTitle, String slug, String description, Boolean isVisible, User author) {
        Page page = pageRepository.findTopByPageIdOrderByVersionDesc(pageId)
                .orElseThrow(() -> new RuntimeException("Page not found with pageId: " + pageId));

        if (name != null) {
            page.setName(name);
            // Si le nom change, régénérer le slug automatiquement en excluant les autres versions de cette page
            String newSlug = generateSlugForPage(page.getParentPage() != null ? page.getParentPage().getSlug() : null, name, page.getPageId());
            page.setSlug(newSlug);
        }
        if (title != null) page.setTitle(title);
        if (subTitle != null) page.setSubTitle(subTitle);
        // Permettre la modification manuelle du slug si fourni
        if (slug != null && !slug.isEmpty()) {
            page.setSlug(ensureUniqueSlug(slug, page.getPageId()));
        }
        if (description != null) page.setDescription(description);
        if (isVisible != null) page.setIsVisible(isVisible);
        page.setAuthor(author);

        return pageRepository.save(page);
    }

    private String generateSlug(String parentSlug, String name) {
        String baseSlug = name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .trim();

        String fullSlug;
        if (parentSlug != null && !parentSlug.equals("/")) {
            fullSlug = parentSlug + "/" + baseSlug;
        } else {
            fullSlug = "/" + baseSlug;
        }

        // Vérifier l'unicité et ajouter un suffixe si nécessaire
        return ensureUniqueSlug(fullSlug);
    }

    private String ensureUniqueSlug(String baseSlug) {
        return ensureUniqueSlug(baseSlug, null);
    }

    private String ensureUniqueSlug(String baseSlug, UUID excludePageId) {
        String slug = baseSlug;
        int counter = 1;

        // Tant qu'un slug existe déjà (en excluant les autres versions de la même page), ajouter un suffixe numérique
        while (slugExistsForDifferentPage(slug, excludePageId)) {
            slug = baseSlug + "-" + counter;
            counter++;
        }

        return slug;
    }

    private String generateSlugForPage(String parentSlug, String name, UUID pageId) {
        String baseSlug = name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .trim();

        String fullSlug;
        if (parentSlug != null && !parentSlug.equals("/")) {
            fullSlug = parentSlug + "/" + baseSlug;
        } else {
            fullSlug = "/" + baseSlug;
        }

        // Vérifier l'unicité en excluant les autres versions de cette même page
        return ensureUniqueSlug(fullSlug, pageId);
    }

    private boolean slugExistsForDifferentPage(String slug, UUID excludePageId) {
        Optional<Page> existingPage = pageRepository.findBySlug(slug);
        if (existingPage.isEmpty()) {
            return false;
        }

        // Si excludePageId est fourni, vérifier que le slug n'appartient pas à une autre version de la même page
        if (excludePageId != null) {
            return !existingPage.get().getPageId().equals(excludePageId);
        }

        return true;
    }

    public Page setHeroMediaLastVersion(UUID pageId, UUID heroMediaId) {
        Page lastVersion = pageRepository.findTopByPageIdOrderByVersionDesc(pageId)
                .orElseThrow(() -> new RuntimeException("Page not found"));

        Media media = mediaRepository.findById(heroMediaId)
                .orElseThrow(() -> new RuntimeException("Media not found"));

        lastVersion.setHeroMedia(media);
        return pageRepository.save(lastVersion);
    }

    public Page removeHeroMediaLastVersion(UUID pageId) {
        Page lastVersion = pageRepository.findTopByPageIdOrderByVersionDesc(pageId)
                .orElseThrow(() -> new RuntimeException("Page not found"));

        lastVersion.setHeroMedia(null);
        return pageRepository.save(lastVersion);
    }

    @Transactional
    public void delete(UUID pageId) {
        // Trouver la page par pageId (identifiant logique) et non par id (identifiant technique)
        Page page = pageRepository.findTopByPageIdOrderByVersionDesc(pageId)
                .orElseThrow(() -> new RuntimeException("Page not found with pageId: " + pageId));

        // Supprimer avec l'id technique de l'entité
        pageRepository.softDeleteById(page.getId());
    }

    public Page updatePageVisibility(UUID pageId, Boolean isVisible, User author) {
        // D'abord essayer de trouver par pageId (identifiant de version)
        Optional<Page> pageOpt = pageRepository.findTopByPageIdOrderByVersionDesc(pageId);

        // Si pas trouvé, essayer de trouver par id direct
        if (pageOpt.isEmpty()) {
            pageOpt = pageRepository.findById(pageId);
        }

        Page page = pageOpt.orElseThrow(() -> new RuntimeException("Page not found with id: " + pageId));

        page.setIsVisible(isVisible);
        page.setAuthor(author);

        return pageRepository.save(page);
    }
}
