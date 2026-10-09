package com.stemadeleine.api.service;

import com.stemadeleine.api.model.Page;
import com.stemadeleine.api.model.PublishingStatus;
import com.stemadeleine.api.repository.ContentRepository;
import com.stemadeleine.api.repository.ModuleRepository;
import com.stemadeleine.api.repository.PageRepository;
import com.stemadeleine.api.repository.SectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Tells whether a DRAFT subtree differs from its PUBLISHED counterpart (a draft is "unpublished" when
 * it has no PUBLISHED row or when the PUBLISHED row has another version). Each level is checked with a
 * single batch query, so the cost does not depend on the number of items.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PublicationStatusService {

    private final PageRepository pageRepository;
    private final SectionRepository sectionRepository;
    private final ModuleRepository moduleRepository;
    private final ContentRepository contentRepository;

    public boolean pageHasUnpublishedChanges(UUID pageId) {
        Set<UUID> pageIds = collectPageSubtree(pageId);
        if (pageRepository.countUnpublishedDrafts(pageIds) > 0) {
            return true;
        }
        return sectionsHaveUnpublishedChanges(sectionRepository.findDraftSectionIdsByPageIds(pageIds));
    }

    public boolean sectionHasUnpublishedChanges(UUID sectionId) {
        return sectionsHaveUnpublishedChanges(List.of(sectionId));
    }

    public boolean moduleHasUnpublishedChanges(UUID moduleId) {
        return moduleRepository.findByModuleIdAndStatus(moduleId, PublishingStatus.DRAFT)
                .map(draft -> moduleRepository.findByModuleIdAndStatus(moduleId, PublishingStatus.PUBLISHED)
                        .map(published -> !published.getVersion().equals(draft.getVersion()))
                        .orElse(true)
                        || contentRepository.countUnpublishedDrafts(List.of(moduleId)) > 0)
                .orElse(false);
    }

    private boolean sectionsHaveUnpublishedChanges(List<UUID> sectionIds) {
        if (sectionIds.isEmpty()) {
            return false;
        }
        if (sectionRepository.countUnpublishedDrafts(sectionIds) > 0
                || moduleRepository.countUnpublishedDrafts(sectionIds) > 0) {
            return true;
        }
        List<UUID> owners = new ArrayList<>(sectionIds);
        owners.addAll(moduleRepository.findDraftModuleIdsBySectionIds(sectionIds));
        return contentRepository.countUnpublishedDrafts(owners) > 0;
    }

    /**
     * The page and all its descendant DRAFT pages (a single query, the tree is walked in memory).
     */
    private Set<UUID> collectPageSubtree(UUID pageId) {
        List<Page> drafts = pageRepository.findByStatus(PublishingStatus.DRAFT);
        Set<UUID> result = new HashSet<>();
        result.add(pageId);
        boolean added = true;
        while (added) {
            added = false;
            for (Page page : drafts) {
                if (page.getParentPage() != null
                        && result.contains(page.getParentPage().getPageId())
                        && result.add(page.getPageId())) {
                    added = true;
                }
            }
        }
        return result;
    }
}
