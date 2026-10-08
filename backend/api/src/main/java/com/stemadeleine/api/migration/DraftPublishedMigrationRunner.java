package com.stemadeleine.api.migration;

import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.Page;
import com.stemadeleine.api.model.PublishingStatus;
import com.stemadeleine.api.model.Section;
import com.stemadeleine.api.repository.ModuleRepository;
import com.stemadeleine.api.repository.PageRepository;
import com.stemadeleine.api.repository.SectionRepository;
import com.stemadeleine.api.service.ModuleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.BiConsumer;
import java.util.function.Function;
import java.util.function.UnaryOperator;

/**
 * One-shot and idempotent migration of pages, sections and modules to the draft/published model
 * (at most one DRAFT and one PUBLISHED row per logical id).
 * <p>
 * Nothing is deleted: the old versions are only switched to ARCHIVED, so that they stay available in
 * the database but are ignored by the application. Missing DRAFT rows are created from the PUBLISHED
 * row, and the links (parent page, page of a section, section of a module) are re-pointed so that
 * DRAFT rows point to DRAFT rows and PUBLISHED rows to PUBLISHED rows.
 * <p>
 * Can be disabled with {@code app.migration.draft-published.enabled=false}.
 */
@Slf4j
@Component
@Order(100)
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.migration.draft-published.enabled", havingValue = "true", matchIfMissing = true)
public class DraftPublishedMigrationRunner implements ApplicationRunner {

    private final PageRepository pageRepository;
    private final SectionRepository sectionRepository;
    private final ModuleRepository moduleRepository;
    private final ModuleService moduleService;

    /**
     * Rows kept for one logical id.
     */
    private static class Kept<T> {
        T draft;
        T published;
        T deleted;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        try {
            migrate();
        } catch (RuntimeException e) {
            log.error("Draft/published migration failed, nothing has been changed: {}", e.getMessage(), e);
            throw e;
        }
    }

    void migrate() {
        // ---- Pages ----
        Map<UUID, Kept<Page>> pages = normalize(
                pageRepository.findAll(), Page::getPageId, Page::getStatus, Page::setStatus,
                Page::getVersion, Page::getUpdatedAt, this::draftOfPage);

        for (Kept<Page> kept : pages.values()) {
            relinkPage(kept.draft, pages, true);
            relinkPage(kept.published, pages, false);
            relinkPage(kept.deleted, pages, true);
        }
        pageRepository.flush();

        // ---- Sections ----
        Map<UUID, Kept<Section>> sections = normalize(
                sectionRepository.findAll(), Section::getSectionId, Section::getStatus, Section::setStatus,
                Section::getVersion, Section::getUpdatedAt, this::draftOfSection);

        for (Kept<Section> kept : sections.values()) {
            relinkSection(kept.draft, pages, true);
            relinkSection(kept.published, pages, false);
            relinkSection(kept.deleted, pages, true);
        }
        sectionRepository.flush();

        // ---- Modules ----
        Map<UUID, Kept<Module>> modules = normalize(
                moduleRepository.findAll(), Module::getModuleId, Module::getStatus, Module::setStatus,
                Module::getVersion, Module::getUpdatedAt,
                published -> moduleService.cloneModule(published, PublishingStatus.DRAFT,
                        published.getVersion(), published.getSection(), published.getAuthor()));

        for (Kept<Module> kept : modules.values()) {
            relinkModule(kept.draft, sections, true);
            relinkModule(kept.published, sections, false);
            relinkModule(kept.deleted, sections, true);
        }
        moduleRepository.flush();

        log.info("Draft/published migration done ({} pages, {} sections, {} modules)",
                pages.size(), sections.size(), modules.size());
    }

    /**
     * Keeps at most one DRAFT and one PUBLISHED row per logical id and archives the other ones.
     */
    private <T> Map<UUID, Kept<T>> normalize(
            List<T> rows,
            Function<T, UUID> logicalId,
            Function<T, PublishingStatus> status,
            BiConsumer<T, PublishingStatus> setStatus,
            Function<T, Integer> version,
            Function<T, OffsetDateTime> updatedAt,
            UnaryOperator<T> newDraftFrom
    ) {
        Comparator<T> latestFirst = Comparator
                .comparing((T r) -> version.apply(r) != null ? version.apply(r) : 0).reversed()
                .thenComparing(Comparator.comparing(
                        (T r) -> updatedAt.apply(r), Comparator.nullsFirst(Comparator.naturalOrder())).reversed());

        Map<UUID, List<T>> byLogicalId = new HashMap<>();
        rows.forEach(r -> byLogicalId.computeIfAbsent(logicalId.apply(r), k -> new ArrayList<>()).add(r));

        Map<UUID, Kept<T>> result = new HashMap<>();
        int archived = 0;
        int created = 0;
        for (Map.Entry<UUID, List<T>> entry : byLogicalId.entrySet()) {
            List<T> group = entry.getValue();
            group.sort(latestFirst);
            Kept<T> kept = new Kept<>();
            T latest = group.get(0);

            if (status.apply(latest) == PublishingStatus.DELETED) {
                kept.deleted = latest;
            } else {
                kept.published = group.stream().filter(r -> status.apply(r) == PublishingStatus.PUBLISHED).findFirst().orElse(null);
                kept.draft = group.stream().filter(r -> status.apply(r) == PublishingStatus.DRAFT)
                        .filter(r -> kept.published == null
                                || version.apply(r) >= version.apply(kept.published))
                        .findFirst().orElse(null);
            }

            for (T row : group) {
                PublishingStatus s = status.apply(row);
                boolean keep = row == kept.draft || row == kept.published || row == kept.deleted;
                if (!keep && (s == PublishingStatus.DRAFT || s == PublishingStatus.PUBLISHED)) {
                    setStatus.accept(row, PublishingStatus.ARCHIVED);
                    archived++;
                }
            }

            if (kept.draft == null && kept.deleted == null && kept.published != null) {
                kept.draft = newDraftFrom.apply(kept.published);
                created++;
            }
            result.put(entry.getKey(), kept);
        }
        log.info("Draft/published migration: {} old rows archived, {} drafts created", archived, created);
        return result;
    }

    private Page draftOfPage(Page published) {
        return pageRepository.save(Page.builder()
                .pageId(published.getPageId())
                .version(published.getVersion())
                .name(published.getName())
                .title(published.getTitle())
                .subTitle(published.getSubTitle())
                .slug(published.getSlug())
                .description(published.getDescription())
                .status(PublishingStatus.DRAFT)
                .sortOrder(published.getSortOrder())
                .parentPage(published.getParentPage())
                .heroMedia(published.getHeroMedia())
                .author(published.getAuthor())
                .isVisible(published.getIsVisible())
                .build());
    }

    private Section draftOfSection(Section published) {
        return sectionRepository.save(Section.builder()
                .sectionId(published.getSectionId())
                .page(published.getPage())
                .version(published.getVersion())
                .name(published.getName())
                .title(published.getTitle())
                .sortOrder(published.getSortOrder())
                .author(published.getAuthor())
                .status(PublishingStatus.DRAFT)
                .isVisible(published.getIsVisible())
                .media(published.getMedia())
                .build());
    }

    /**
     * Re-points a page to the parent row having the same status. A row whose parent has no row of that
     * status becomes a root page.
     */
    private void relinkPage(Page page, Map<UUID, Kept<Page>> pages, boolean draftSide) {
        if (page == null || page.getParentPage() == null) {
            return;
        }
        Kept<Page> parent = pages.get(page.getParentPage().getPageId());
        Page target = parent == null ? null : (draftSide ? parent.draft : parent.published);
        if (target == null && draftSide && parent != null) {
            target = parent.deleted;
        }
        if (target != page.getParentPage()) {
            page.setParentPage(target);
            pageRepository.save(page);
        }
    }

    private void relinkSection(Section section, Map<UUID, Kept<Page>> pages, boolean draftSide) {
        if (section == null || section.getPage() == null) {
            return;
        }
        Kept<Page> page = pages.get(section.getPage().getPageId());
        Page target = page == null ? null : (draftSide ? page.draft : page.published);
        if (target == null && draftSide && page != null) {
            target = page.deleted;
        }
        if (target == null) {
            // Section of a page which does not exist (anymore) on this side: it follows the page
            section.setStatus(draftSide ? PublishingStatus.DELETED : PublishingStatus.ARCHIVED);
            sectionRepository.save(section);
            return;
        }
        if (target != section.getPage()) {
            section.setPage(target);
        }
        if (target.getStatus() == PublishingStatus.DELETED && section.getStatus() == PublishingStatus.DRAFT) {
            section.setStatus(PublishingStatus.DELETED);
        }
        sectionRepository.save(section);
    }

    private void relinkModule(Module module, Map<UUID, Kept<Section>> sections, boolean draftSide) {
        if (module == null || module.getSection() == null) {
            return;
        }
        Kept<Section> section = sections.get(module.getSection().getSectionId());
        Section target = section == null ? null : (draftSide ? section.draft : section.published);
        if (target == null && draftSide && section != null) {
            target = section.deleted;
        }
        if (target == null) {
            module.setStatus(draftSide ? PublishingStatus.DELETED : PublishingStatus.ARCHIVED);
            moduleRepository.save(module);
            return;
        }
        if (target != module.getSection()) {
            module.setSection(target);
        }
        if (target.getStatus() == PublishingStatus.DELETED && module.getStatus() == PublishingStatus.DRAFT) {
            module.setStatus(PublishingStatus.DELETED);
        }
        moduleRepository.save(module);
    }
}
