package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.PageDto;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.repository.MediaRepository;
import com.stemadeleine.api.repository.PageRepository;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.*;
import java.util.function.BinaryOperator;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
public class PageService {

    private final MediaRepository mediaRepository;
    private final PageRepository pageRepository;
    private final SectionService sectionService;

    public PageService(MediaRepository mediaRepository, PageRepository pageRepository, @Lazy SectionService sectionService) {
        this.mediaRepository = mediaRepository;
        this.pageRepository = pageRepository;
        this.sectionService = sectionService;
    }

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

    private void filterDeletedChildren(Page page) {
        if (page.getChildren() != null) {
            // Regrouper les enfants par pageId et ne garder que la version la plus élevée
            Map<UUID, Page> latestChildren = page.getChildren().stream()
                    .filter(child -> child.getStatus() != PublishingStatus.DELETED)
                    .collect(Collectors.toMap(
                            Page::getPageId,
                            Function.identity(),
                            BinaryOperator.maxBy(Comparator.comparingInt(Page::getVersion))
                    ));
            // Appliquer récursivement le filtrage sur les enfants
            latestChildren.values().forEach(this::filterDeletedChildren);
            // Remettre la liste des enfants (complets)
            List<Page> filteredChildren = latestChildren.values().stream()
                    .sorted(Comparator.comparing(c -> c.getSortOrder() != null ? c.getSortOrder() : 0))
                    .toList();
            page.setChildren(filteredChildren);
        }
    }

    public List<Page> getLatestPagesForTree() {
        Map<UUID, Page> latestPages = pageRepository.findAll().stream()
                .filter(p -> p.getStatus() != PublishingStatus.DELETED)
                .collect(Collectors.toMap(Page::getPageId, Function.identity(), BinaryOperator.maxBy(Comparator.comparingInt(Page::getVersion))));

        // Nettoyer les enfants
        latestPages.values().forEach(page -> page.setChildren(new ArrayList<>()));

        // Recréer la hiérarchie
        for (Page page : latestPages.values()) {
            Page parent = page.getParentPage();
            if (parent != null && latestPages.containsKey(parent.getPageId())) {
                latestPages.get(parent.getPageId()).getChildren().add(page);
            }
        }

        // Ne retourner que les vraies racines
        List<Page> roots = latestPages.values().stream()
                .filter(page -> page.getParentPage() == null)
                .sorted(Comparator.comparing(page -> page.getSortOrder() != null ? page.getSortOrder() : 0))
                .toList();
        // Filtrer récursivement les enfants supprimés
        roots.forEach(this::filterDeletedChildren);
        return roots;
    }

    public Page getPageById(UUID pageId) {
        return pageRepository.findById(pageId)
                .orElseThrow(() -> new RuntimeException("Page not found with id: " + pageId));
    }

    @Transactional
    public Page publishPage(UUID pageId, User author) {
        Page page = getLastVersion(pageId)
                .orElseThrow(() -> new RuntimeException("Page not found: " + pageId));
        publishPageRecursive(page, author);
        return pageRepository.save(page);
    }

    private void publishPageRecursive(Page page, User author) {
        page.setStatus(PublishingStatus.PUBLISHED);
        page.setAuthor(author);
        page.setUpdatedAt(java.time.OffsetDateTime.now());
        if (page.getChildren() != null) {
            for (Page child : page.getChildren()) {
                publishPageRecursive(child, author);
                pageRepository.save(child);
            }
        }
    }

    public List<Page> getAllPages() {
        return pageRepository.findAll();
    }

    @Transactional
    public void updatePageTree(List<PageDto> tree, Page parent) {
        int sortOrder = 0;

        for (PageDto dto : tree) {
            Page page = pageRepository.findById(dto.id())
                    .orElseThrow(() -> new RuntimeException("Page not found: " + dto.id()));

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

        // Generate slug based on name and parent
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
            // If name changes, regenerate slug automatically excluding other versions of this page
            String newSlug = generateSlugForPage(page.getParentPage() != null ? page.getParentPage().getSlug() : null, name, page.getPageId());
            page.setSlug(newSlug);
        }
        if (title != null) page.setTitle(title);
        if (subTitle != null) page.setSubTitle(subTitle);
        // Allow manual slug modification if provided
        if (slug != null && !slug.isEmpty()) {
            page.setSlug(ensureUniqueSlug(slug, page.getPageId()));
        }
        if (description != null) page.setDescription(description);
        if (isVisible != null) page.setIsVisible(isVisible);
        page.setAuthor(author);

        return pageRepository.save(page);
    }

    @Transactional
    public Page createPageVersion(UUID pageId, String name, String title, String subTitle, String slug, String description, Boolean isVisible, User author) {
        Page currentPage = pageRepository.findTopByPageIdOrderByVersionDesc(pageId)
                .orElseThrow(() -> new RuntimeException("Page not found with pageId: " + pageId));

        String newName = name != null ? name : currentPage.getName();
        String newSlug;
        String normalizedName = newName.trim().toLowerCase();
        if (normalizedName.equals("accueil") || normalizedName.equals("home")) {
            newSlug = "/";
        } else if (!newName.equals(currentPage.getName())) {
            // Name changé, slug à régénérer systématiquement
            String parentSlug = currentPage.getParentPage() != null ? currentPage.getParentPage().getSlug() : null;
            newSlug = generateSlugForPage(parentSlug, newName, pageId);
        } else if (slug != null && !slug.isEmpty()) {
            newSlug = ensureUniqueSlug(slug, pageId);
        } else {
            newSlug = currentPage.getSlug();
        }

        // Create new page version
        Page newPage = Page.builder()
                .pageId(pageId)
                .version(currentPage.getVersion() + 1)
                .name(newName)
                .title(title != null ? title : currentPage.getTitle())
                .subTitle(subTitle != null ? subTitle : currentPage.getSubTitle())
                .slug(newSlug)
                .description(description != null ? description : currentPage.getDescription())
                .status(PublishingStatus.DRAFT)
                .sortOrder(currentPage.getSortOrder())
                .parentPage(currentPage.getParentPage())
                .heroMedia(currentPage.getHeroMedia())
                .author(author)
                .isVisible(isVisible != null ? isVisible : currentPage.getIsVisible())
                .build();

        // Attach existing sections to new page version (without duplication)
        List<Section> sectionsToAttach = currentPage.getSections() != null ? new ArrayList<>(currentPage.getSections()) : new ArrayList<>();
        for (Section section : sectionsToAttach) {
            section.setPage(newPage);
        }
        newPage.setSections(sectionsToAttach);

        Page savedPage = pageRepository.save(newPage);
        if (!sectionsToAttach.isEmpty()) {
            sectionService.saveAll(sectionsToAttach);
        }

        // Dynamically reattach all children to the new version
        List<Page> children = pageRepository.findByParentPage(currentPage);
        for (Page child : children) {
            child.setParentPage(savedPage);
        }
        if (!children.isEmpty()) {
            pageRepository.saveAll(children);
        }
        savedPage.setChildren(children);

        log.debug("Page version created, sections and children re-attached: version {} for pageId: {}", savedPage.getVersion(), savedPage.getPageId());
        return savedPage;
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

        // Check uniqueness and add suffix if necessary
        return ensureUniqueSlug(fullSlug);
    }

    private String ensureUniqueSlug(String baseSlug) {
        return ensureUniqueSlug(baseSlug, null);
    }

    private String ensureUniqueSlug(String baseSlug, UUID excludePageId) {
        String slug = baseSlug;
        int counter = 1;

        // While a slug already exists (excluding other versions of the same page), add a numeric suffix
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

        // Check uniqueness excluding other versions of this same page
        return ensureUniqueSlug(fullSlug, pageId);
    }

    private boolean slugExistsForDifferentPage(String slug, UUID excludePageId) {
        Optional<Page> existingPage = pageRepository.findBySlug(slug);
        if (existingPage.isEmpty()) {
            return false;
        }

        // If excludePageId is provided, check that the slug doesn't belong to another version of the same page
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

        // Update media ownerId
        media.setOwnerId(pageId);
        mediaRepository.save(media);

        lastVersion.setHeroMedia(media);
        return pageRepository.save(lastVersion);
    }

    public Page removeHeroMediaLastVersion(UUID pageId) {
        Page lastVersion = pageRepository.findTopByPageIdOrderByVersionDesc(pageId)
                .orElseThrow(() -> new RuntimeException("Page not found"));

        Media media = lastVersion.getHeroMedia();
        if (media != null) {
            media.setOwnerId(null);
            mediaRepository.save(media);
        }

        lastVersion.setHeroMedia(null);
        return pageRepository.save(lastVersion);
    }

    @Transactional
    public void delete(UUID pageId) {
        // Find page by pageId (logical identifier) not by id (technical identifier)
        Page page = pageRepository.findTopByPageIdOrderByVersionDesc(pageId)
                .orElseThrow(() -> new RuntimeException("Page not found with pageId: " + pageId));

        // Delete using entity technical id
        pageRepository.softDeleteById(page.getId());
    }

    public Page updatePageVisibility(UUID pageId, Boolean isVisible, User author) {
        // First try to find by pageId (version identifier)
        Optional<Page> pageOpt = pageRepository.findTopByPageIdOrderByVersionDesc(pageId);

        // If not found, try to find by direct id
        if (pageOpt.isEmpty()) {
            pageOpt = pageRepository.findById(pageId);
        }

        Page page = pageOpt.orElseThrow(() -> new RuntimeException("Page not found with id: " + pageId));

        page.setIsVisible(isVisible);
        page.setAuthor(author);

        return pageRepository.save(page);
    }

    // ==== METHODS FOR PUBLIC ENDPOINTS ====

    /**
     * Nouvelle méthode : récupère la hiérarchie des pages visibles et publiées (dernière version)
     */
    public List<Page> findVisiblePagesHierarchy() {
        // Récupérer toutes les pages visibles et publiées, dernière version uniquement
        Map<UUID, Page> latestPages = pageRepository.findAll().stream()
                .filter(p -> p.getStatus() == PublishingStatus.PUBLISHED && p.getIsVisible())
                .collect(Collectors.toMap(Page::getPageId, Function.identity(), BinaryOperator.maxBy(Comparator.comparingInt(Page::getVersion))));

        // Nettoyer les enfants
        latestPages.values().forEach(page -> page.setChildren(new ArrayList<>()));

        // Construire la hiérarchie
        List<Page> roots = new ArrayList<>();
        for (Page page : latestPages.values()) {
            Page parent = page.getParentPage();
            if (parent == null || parent.getPageId() == null || !latestPages.containsKey(parent.getPageId())) {
                roots.add(page);
            } else {
                latestPages.get(parent.getPageId()).getChildren().add(page);
            }
        }

        // Trier les racines
        roots.sort(Comparator.comparing(p -> p.getSortOrder() != null ? p.getSortOrder() : 0));
        return roots;
    }


    /**
     * Finds a published and visible page by its slug
     */
    public Optional<Page> findBySlugAndVisible(String slug, boolean visible) {
        // D'abord trouver toutes les pages avec ce slug
        List<Page> pagesWithSlug = pageRepository.findAll().stream()
                .filter(page -> slug.equals(page.getSlug()))
                .filter(page -> page.getStatus() == PublishingStatus.PUBLISHED)
                .filter(page -> page.getIsVisible() == visible)
                .collect(Collectors.toList());

        // Si plusieurs versions, prendre la plus récente
        return pagesWithSlug.stream()
                .max(Comparator.comparingInt(Page::getVersion));
    }

    /**
     * Finds a published and visible page by its ID
     */
    public Optional<Page> findByIdAndVisible(UUID id, boolean visible) {
        return getPublishedPage(id)
                .filter(page -> page.getIsVisible() == visible);
    }

    /**
     * Search in visible pages by title, name, subtitle or description
     */
    public List<Page> searchInVisiblePages(String query) {
        return pageRepository.findAll().stream()
                .filter(page -> page.getStatus() == PublishingStatus.PUBLISHED && page.getIsVisible())
                .collect(Collectors.toMap(Page::getPageId, Function.identity(), BinaryOperator.maxBy(Comparator.comparingInt(Page::getVersion))))
                .values().stream()
                .filter(page ->
                        (page.getTitle() != null && page.getTitle().toLowerCase().contains(query.toLowerCase())) ||
                                (page.getName() != null && page.getName().toLowerCase().contains(query.toLowerCase())) ||
                                (page.getSubTitle() != null && page.getSubTitle().toLowerCase().contains(query.toLowerCase())) ||
                                (page.getDescription() != null && page.getDescription().toLowerCase().contains(query.toLowerCase()))
                )
                .sorted(Comparator.comparing(Page::getTitle))
                .toList();
    }

    /**
     * Convertit une entité Page en PageDto, récursivement pour les enfants, sans inclure le parent
     */
    public PageDto toPageDto(Page page) {
        List<PageDto> childrenDto = page.getChildren() != null ?
                page.getChildren().stream().map(this::toPageDto).toList() : List.of();
        return new PageDto(
                page.getId(),
                page.getPageId(),
                page.getName(),
                page.getTitle(),
                page.getSubTitle(),
                page.getSlug(),
                page.getDescription(),
                page.getStatus(),
                page.getSortOrder(),
                page.getIsVisible(),
                childrenDto
        );
    }

    /**
     * Expose la hiérarchie des pages visibles et publiées sous forme de PageDto
     */
    public List<PageDto> findVisiblePagesHierarchyDto() {
        List<Page> roots = findVisiblePagesHierarchy();
        return roots.stream().map(this::toPageDto).toList();
    }
}
