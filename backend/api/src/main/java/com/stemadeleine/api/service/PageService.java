package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.PageDto;
import com.stemadeleine.api.dto.PublicationInfoDto;
import com.stemadeleine.api.model.Media;
import com.stemadeleine.api.model.Page;
import com.stemadeleine.api.model.PublishingStatus;
import com.stemadeleine.api.model.Section;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.MediaRepository;
import com.stemadeleine.api.repository.PageRepository;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Pages are stored as two rows per logical page (pageId): one DRAFT (backoffice working copy,
 * version incremented on every edit) and one PUBLISHED (public site, receives the draft's version on publish).
 * Deleting a page marks the DRAFT as DELETED and the PUBLISHED as ARCHIVED.
 */
@Service
@Slf4j
public class PageService {

    private final MediaRepository mediaRepository;
    private final PageRepository pageRepository;
    private final SectionService sectionService;
    private final PublicationStatusService publicationStatusService;

    public PageService(MediaRepository mediaRepository, PageRepository pageRepository, @Lazy SectionService sectionService,
                       PublicationStatusService publicationStatusService) {
        this.mediaRepository = mediaRepository;
        this.pageRepository = pageRepository;
        this.sectionService = sectionService;
        this.publicationStatusService = publicationStatusService;
    }

    // ==== READ ====

    /**
     * PUBLISHED row of a page (public site).
     */
    public Optional<Page> getPublishedPage(UUID pageId) {
        return pageRepository.findByPageIdAndStatus(pageId, PublishingStatus.PUBLISHED);
    }

    /**
     * DRAFT row of a page (backoffice).
     */
    public Optional<Page> getLastVersion(UUID pageId) {
        return pageRepository.findByPageIdAndStatus(pageId, PublishingStatus.DRAFT);
    }

    public Optional<Page> getDraftBySlug(String slug) {
        return pageRepository.findBySlugAndStatus(slug, PublishingStatus.DRAFT).stream().findFirst();
    }

    public Optional<Page> getPublishedPageBySlug(String slug) {
        return pageRepository.findBySlugAndStatus(slug, PublishingStatus.PUBLISHED).stream()
                .filter(Page::getIsVisible)
                .findFirst();
    }

    public Page getPageById(UUID id) {
        return pageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Page not found with id: " + id));
    }

    public List<Page> getAllPages() {
        return pageRepository.findByStatus(PublishingStatus.DRAFT);
    }

    /**
     * Backoffice page tree (DRAFT rows only).
     */
    public List<PageDto> getDraftTree() {
        return buildTree(pageRepository.findByStatus(PublishingStatus.DRAFT));
    }

    /**
     * Public navigation tree (PUBLISHED and visible rows only).
     */
    public List<PageDto> findVisiblePagesHierarchyDto() {
        return buildTree(pageRepository.findByStatus(PublishingStatus.PUBLISHED).stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsVisible()))
                .toList());
    }

    private List<PageDto> buildTree(List<Page> pages) {
        Map<UUID, List<Page>> childrenByParent = new HashMap<>();
        Map<UUID, Page> byId = new HashMap<>();
        pages.forEach(p -> byId.put(p.getId(), p));
        List<Page> roots = new ArrayList<>();
        for (Page page : pages) {
            Page parent = page.getParentPage();
            if (parent == null || !byId.containsKey(parent.getId())) {
                roots.add(page);
            } else {
                childrenByParent.computeIfAbsent(parent.getId(), k -> new ArrayList<>()).add(page);
            }
        }
        return toDtos(roots, childrenByParent);
    }

    private List<PageDto> toDtos(List<Page> pages, Map<UUID, List<Page>> childrenByParent) {
        return pages.stream()
                .sorted(Comparator.comparing(p -> p.getSortOrder() != null ? p.getSortOrder() : 0))
                .map(p -> new PageDto(
                        p.getId(), p.getPageId(), p.getName(), p.getTitle(), p.getSubTitle(), p.getSlug(),
                        p.getDescription(), p.getStatus(), p.getSortOrder(), p.getIsVisible(),
                        toDtos(childrenByParent.getOrDefault(p.getId(), List.of()), childrenByParent)))
                .toList();
    }

    // ==== WRITE (DRAFT) ====

    public Page createNewPage(UUID parentPageId, String name, User author) {
        Page parentPage = null;
        if (parentPageId != null) {
            parentPage = getLastVersion(parentPageId)
                    .orElseThrow(() -> new RuntimeException("Parent page not found with id: " + parentPageId));
        }

        Integer maxSortOrder = pageRepository.findMaxSortOrderByParentPageAndStatus(parentPageId, PublishingStatus.DRAFT);
        if (maxSortOrder == null) {
            maxSortOrder = 0;
        }

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

    @Transactional
    public Page updatePage(UUID pageId, String name, String title, String subTitle, String slug, String description, Boolean isVisible, User author) {
        Page page = getDraftOrThrow(pageId);

        if (name != null) {
            page.setName(name);
            page.setSlug(generateSlugForPage(page.getParentPage() != null ? page.getParentPage().getSlug() : null, name, page.getPageId()));
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

        return saveDraft(page);
    }

    /**
     * Updates the DRAFT of the page in place (version incremented, no new row).
     */
    @Transactional
    public Page createPageVersion(UUID pageId, String name, String title, String subTitle, String slug, String description, Boolean isVisible, User author) {
        Page page = getDraftOrThrow(pageId);

        String newName = name != null ? name : page.getName();
        String newSlug;
        String normalizedName = newName.trim().toLowerCase();
        if (normalizedName.equals("accueil") || normalizedName.equals("home")) {
            newSlug = "/";
        } else if (!newName.equals(page.getName())) {
            String parentSlug = page.getParentPage() != null ? page.getParentPage().getSlug() : null;
            newSlug = generateSlugForPage(parentSlug, newName, pageId);
        } else if (slug != null && !slug.isEmpty()) {
            newSlug = ensureUniqueSlug(slug, pageId);
        } else {
            newSlug = page.getSlug();
        }

        page.setName(newName);
        page.setSlug(newSlug);
        if (title != null) page.setTitle(title);
        if (subTitle != null) page.setSubTitle(subTitle);
        if (description != null) page.setDescription(description);
        if (isVisible != null) page.setIsVisible(isVisible);
        page.setAuthor(author);

        return saveDraft(page);
    }

    @Transactional
    public void updatePageTree(List<PageDto> tree, Page parent) {
        int sortOrder = 0;

        for (PageDto dto : tree) {
            Page page = pageRepository.findById(dto.id())
                    .filter(p -> p.getStatus() == PublishingStatus.DRAFT)
                    .orElseThrow(() -> new RuntimeException("Draft page not found: " + dto.id()));

            page.setParentPage(parent);
            page.setSortOrder(sortOrder++);
            if (dto.isVisible() != null) {
                page.setIsVisible(dto.isVisible());
            }
            saveDraft(page);

            if (dto.children() != null && !dto.children().isEmpty()) {
                updatePageTree(dto.children(), page);
            }
        }
    }

    @Transactional
    public Page updatePageVisibility(UUID pageId, Boolean isVisible, User author) {
        Page page = getLastVersion(pageId)
                .or(() -> pageRepository.findById(pageId).filter(p -> p.getStatus() == PublishingStatus.DRAFT))
                .orElseThrow(() -> new RuntimeException("Page not found with id: " + pageId));

        page.setIsVisible(isVisible);
        page.setAuthor(author);
        return saveDraft(page);
    }

    @Transactional
    public Page setHeroMediaLastVersion(UUID pageId, UUID heroMediaId) {
        Page page = getDraftOrThrow(pageId);

        Media media = mediaRepository.findById(heroMediaId)
                .orElseThrow(() -> new RuntimeException("Media not found"));

        media.setOwnerId(pageId);
        mediaRepository.save(media);

        page.setHeroMedia(media);
        return saveDraft(page);
    }

    @Transactional
    public Page removeHeroMediaLastVersion(UUID pageId) {
        Page page = getDraftOrThrow(pageId);

        Media media = page.getHeroMedia();
        if (media != null) {
            media.setOwnerId(null);
            mediaRepository.save(media);
        }

        page.setHeroMedia(null);
        return saveDraft(page);
    }

    // ==== PUBLISH / DELETE ====

    /**
     * Publishes the draft of the page (and, recursively, of its child pages): the PUBLISHED row
     * is created or updated with the draft's content and version. The draft is left untouched.
     */
    @Transactional
    public Page publishPage(UUID pageId, User author) {
        Page draft = getDraftOrThrow(pageId);
        return publishPageRecursive(draft, author);
    }

    /**
     * Publishes every root page and, recursively, all their descendants.
     */
    @Transactional
    public void publishTree(User author) {
        pageRepository.findByStatus(PublishingStatus.DRAFT).stream()
                .filter(p -> p.getParentPage() == null)
                .forEach(p -> publishPageRecursive(p, author));
    }

    private Page publishPageRecursive(Page draft, User author) {
        Page parentPublished = null;
        if (draft.getParentPage() != null) {
            parentPublished = getPublishedPage(draft.getParentPage().getPageId())
                    .orElseThrow(() -> new IllegalStateException(
                            "The parent page must be published before page " + draft.getPageId()));
        }

        Page published = getPublishedPage(draft.getPageId()).orElseGet(() -> Page.builder()
                .pageId(draft.getPageId())
                .status(PublishingStatus.PUBLISHED)
                .build());
        published.setVersion(draft.getVersion());
        published.setName(draft.getName());
        published.setTitle(draft.getTitle());
        published.setSubTitle(draft.getSubTitle());
        published.setSlug(draft.getSlug());
        published.setDescription(draft.getDescription());
        published.setSortOrder(draft.getSortOrder());
        published.setIsVisible(draft.getIsVisible());
        published.setHeroMedia(draft.getHeroMedia());
        published.setParentPage(parentPublished);
        published.setAuthor(author != null ? author : draft.getAuthor());
        published = pageRepository.save(published);

        for (Section section : sectionService.getSectionsByPageId(draft.getPageId())) {
            sectionService.publishSection(section.getSectionId(), author);
        }

        for (Page child : pageRepository.findByParentPageAndStatus(draft, PublishingStatus.DRAFT)) {
            publishPageRecursive(child, author);
        }
        return published;
    }

    /**
     * Resets the draft of the page to its published state, recursively: page data and version,
     * position in the tree, child pages, sections, modules and contents become identical to the
     * published ones. Pages, sections, modules and contents that were never published are deleted.
     */
    @Transactional
    public Page resetPageToPublished(UUID pageId, User author) {
        getDraftOrThrow(pageId);
        getPublishedPage(pageId)
                .orElseThrow(() -> new IllegalStateException("The page has never been published: " + pageId));
        return resetPageRecursive(pageId, author);
    }

    private Page resetPageRecursive(UUID pageId, User author) {
        Page draft = getDraftOrThrow(pageId);
        Page published = getPublishedPage(pageId).orElseThrow();

        draft.setVersion(published.getVersion());
        draft.setName(published.getName());
        draft.setTitle(published.getTitle());
        draft.setSubTitle(published.getSubTitle());
        draft.setSlug(published.getSlug());
        draft.setDescription(published.getDescription());
        draft.setSortOrder(published.getSortOrder());
        draft.setIsVisible(published.getIsVisible());
        draft.setHeroMedia(published.getHeroMedia());
        draft.setParentPage(published.getParentPage() != null
                ? getLastVersion(published.getParentPage().getPageId()).orElse(null)
                : null);
        draft.setAuthor(author);
        draft = pageRepository.save(draft);

        sectionService.resetSectionsOfPage(pageId, author);

        for (Page publishedChild : pageRepository.findByParentPageAndStatus(published, PublishingStatus.PUBLISHED)) {
            resetPageRecursive(publishedChild.getPageId(), author);
        }
        for (Page draftChild : pageRepository.findByParentPageAndStatus(draft, PublishingStatus.DRAFT)) {
            if (getPublishedPage(draftChild.getPageId()).isEmpty()) {
                deleteRecursive(draftChild.getPageId());
            }
        }
        return draft;
    }

    public PublicationInfoDto getPublicationInfo(UUID pageId) {
        Page draft = getDraftOrThrow(pageId);
        Page published = getPublishedPage(pageId).orElse(null);
        return new PublicationInfoDto(
                draft.getVersion(),
                draft.getUpdatedAt(),
                published != null ? published.getVersion() : null,
                published != null ? published.getUpdatedAt() : null,
                publicationStatusService.pageHasUnpublishedChanges(pageId));
    }

    /**
     * Logical deletion: DRAFT becomes DELETED, PUBLISHED becomes ARCHIVED, for the page,
     * its child pages, and their sections and modules.
     */
    @Transactional
    public void delete(UUID pageId) {
        getDraftOrThrow(pageId);
        deleteRecursive(pageId);
    }

    private void deleteRecursive(UUID pageId) {
        for (Page row : pageRepository.findByPageId(pageId)) {
            if (row.getStatus() != PublishingStatus.DRAFT && row.getStatus() != PublishingStatus.PUBLISHED) {
                continue;
            }
            List<UUID> childIds = pageRepository.findByParentPageAndStatus(row, row.getStatus()).stream()
                    .map(Page::getPageId)
                    .toList();
            sectionService.softDeleteSectionsOfPage(row);
            row.setStatus(row.getStatus() == PublishingStatus.DRAFT ? PublishingStatus.DELETED : PublishingStatus.ARCHIVED);
            row.setIsVisible(false);
            pageRepository.save(row);
            childIds.forEach(this::deleteRecursive);
        }
    }

    // ==== PUBLIC ====

    public Optional<Page> findBySlugAndVisible(String slug, boolean visible) {
        return pageRepository.findBySlugAndStatus(slug, PublishingStatus.PUBLISHED).stream()
                .filter(page -> page.getIsVisible() == visible)
                .findFirst();
    }

    /**
     * Finds any published page by its slug, regardless of visibility.
     * Non-visible pages can be accessed directly via their URL but won't appear in navigation.
     */
    public Optional<Page> findPublishedBySlug(String slug) {
        return pageRepository.findBySlugAndStatus(slug, PublishingStatus.PUBLISHED).stream().findFirst();
    }

    /**
     * Finds a published page by its logical pageId (or technical id), filtered on visibility.
     */
    public Optional<Page> findByIdAndVisible(UUID id, boolean visible) {
        return getPublishedPage(id)
                .or(() -> pageRepository.findById(id).filter(p -> p.getStatus() == PublishingStatus.PUBLISHED))
                .filter(page -> page.getIsVisible() == visible);
    }

    public List<Page> searchInVisiblePages(String query) {
        String q = query.toLowerCase();
        return pageRepository.findByStatus(PublishingStatus.PUBLISHED).stream()
                .filter(page -> Boolean.TRUE.equals(page.getIsVisible()))
                .filter(page ->
                        (page.getTitle() != null && page.getTitle().toLowerCase().contains(q)) ||
                                (page.getName() != null && page.getName().toLowerCase().contains(q)) ||
                                (page.getSubTitle() != null && page.getSubTitle().toLowerCase().contains(q)) ||
                                (page.getDescription() != null && page.getDescription().toLowerCase().contains(q)))
                .sorted(Comparator.comparing(Page::getTitle))
                .toList();
    }

    /**
     * Full URL of a page (the slug already contains the parents' path).
     */
    public String buildFullPageUrl(UUID pageId) {
        return getLastVersion(pageId).map(Page::getSlug).orElse(null);
    }

    // ==== HELPERS ====

    private Page getDraftOrThrow(UUID pageId) {
        return getLastVersion(pageId)
                .orElseThrow(() -> new RuntimeException("Page not found with pageId: " + pageId));
    }

    private Page saveDraft(Page page) {
        page.setStatus(PublishingStatus.DRAFT);
        page.setVersion(page.getVersion() + 1);
        return pageRepository.save(page);
    }

    private String generateSlug(String parentSlug, String name) {
        return generateSlugForPage(parentSlug, name, null);
    }

    private String generateSlugForPage(String parentSlug, String name, UUID pageId) {
        String baseSlug = name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .trim();

        String fullSlug = (parentSlug != null && !parentSlug.equals("/"))
                ? parentSlug + "/" + baseSlug
                : "/" + baseSlug;

        return ensureUniqueSlug(fullSlug, pageId);
    }

    private String ensureUniqueSlug(String baseSlug, UUID excludePageId) {
        String slug = baseSlug;
        int counter = 1;
        while (slugExistsForDifferentPage(slug, excludePageId)) {
            slug = baseSlug + "-" + counter;
            counter++;
        }
        return slug;
    }

    private boolean slugExistsForDifferentPage(String slug, UUID excludePageId) {
        return pageRepository.findBySlugAndStatus(slug, PublishingStatus.DRAFT).stream()
                .anyMatch(p -> excludePageId == null || !p.getPageId().equals(excludePageId));
    }
}
