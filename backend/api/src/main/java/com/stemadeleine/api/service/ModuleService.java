package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateContentRequest;
import com.stemadeleine.api.dto.PublicationInfoDto;
import com.stemadeleine.api.model.Article;
import com.stemadeleine.api.model.CTA;
import com.stemadeleine.api.model.Content;
import com.stemadeleine.api.model.Field;
import com.stemadeleine.api.model.Form;
import com.stemadeleine.api.model.Gallery;
import com.stemadeleine.api.model.List;
import com.stemadeleine.api.model.ListContent;
import com.stemadeleine.api.model.Media;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.News;
import com.stemadeleine.api.model.Newsletter;
import com.stemadeleine.api.model.PublishingStatus;
import com.stemadeleine.api.model.Section;
import com.stemadeleine.api.model.Timeline;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.ContentRepository;
import com.stemadeleine.api.repository.FieldRepository;
import com.stemadeleine.api.repository.ModuleRepository;
import com.stemadeleine.api.repository.ModuleSubtypeRepository;
import com.stemadeleine.api.repository.SectionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

/**
 * Module lifecycle with the "2 lines" versioning model.
 * <p>
 * A logical module (moduleId) has at most one DRAFT row and one PUBLISHED row:
 * <ul>
 *     <li>DRAFT: the working copy edited by the backoffice (its version is incremented on every change)</li>
 *     <li>PUBLISHED: the copy displayed on the public site (it receives the DRAFT version when published)</li>
 *     <li>DELETED: logically deleted DRAFT</li>
 *     <li>ARCHIVED: former PUBLISHED of a deleted module</li>
 * </ul>
 * The DRAFT module is attached to the DRAFT section and the PUBLISHED module to the PUBLISHED section.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ModuleService {

    private final ModuleRepository moduleRepository;
    private final SectionRepository sectionRepository;
    private final ContentRepository contentRepository;
    private final FieldRepository fieldRepository;
    private final MediaGalleryService mediaAttachmentService;
    private final ContentService contentService;
    private final PublicationStatusService publicationStatusService;

    // ==== READ ====

    /**
     * All working (DRAFT) modules.
     */
    public java.util.List<Module> getAllModules() {
        return moduleRepository.findAll().stream()
                .filter(m -> m.getStatus() == PublishingStatus.DRAFT)
                .toList();
    }

    /**
     * DRAFT modules of a section (backoffice).
     */
    public java.util.List<Module> getModulesBySection(UUID sectionId) {
        return moduleRepository.findBySectionAndStatus(sectionId, PublishingStatus.DRAFT);
    }

    /**
     * PUBLISHED and visible modules of a section (public site).
     */
    public java.util.List<Module> getPublishedVisibleModulesBySectionId(UUID sectionId) {
        return moduleRepository.findBySectionAndStatus(sectionId, PublishingStatus.PUBLISHED).stream()
                .filter(m -> Boolean.TRUE.equals(m.getIsVisible()))
                .toList();
    }

    /**
     * Module by technical id. Only DRAFT / PUBLISHED rows are exposed.
     */
    public Optional<Module> getModuleById(UUID id) {
        return moduleRepository.findById(id)
                .filter(m -> m.getStatus() == PublishingStatus.DRAFT || m.getStatus() == PublishingStatus.PUBLISHED);
    }

    /**
     * DRAFT of a module (backoffice).
     */
    public Optional<Module> getModuleByModuleId(UUID moduleId) {
        return moduleRepository.findByModuleIdAndStatus(moduleId, PublishingStatus.DRAFT);
    }

    /**
     * PUBLISHED version of a module (public site).
     */
    public Optional<Module> getPublishedModuleByModuleId(UUID moduleId) {
        return moduleRepository.findByModuleIdAndStatus(moduleId, PublishingStatus.PUBLISHED);
    }

    /**
     * DRAFT section in which a new module is created.
     */
    public Section getDraftSection(UUID sectionId) {
        return sectionRepository.findBySectionIdAndStatus(sectionId, PublishingStatus.DRAFT)
                .orElseThrow(() -> new RuntimeException("Section not found for id: " + sectionId));
    }

    /**
     * Resolves the DRAFT row of a module sub type from the technical id of one of its rows.
     */
    public <T extends Module> Optional<T> findDraftByRowId(ModuleSubtypeRepository<T> repository, UUID id) {
        return repository.findById(id).flatMap(row -> row.getStatus() == PublishingStatus.DRAFT
                ? Optional.of(row)
                : repository.findByModuleIdAndStatus(row.getModuleId(), PublishingStatus.DRAFT));
    }

    // ==== DRAFT EDITION ====

    /**
     * Returns the DRAFT of a module, creating it from the PUBLISHED version when it does not exist.
     */
    @Transactional
    public Module createDraftFromPublished(UUID moduleId, User author) {
        Optional<Module> existingDraft = getModuleByModuleId(moduleId);
        if (existingDraft.isPresent()) {
            return existingDraft.get();
        }

        Module published = getPublishedModuleByModuleId(moduleId)
                .orElseThrow(() -> new RuntimeException("Published module not found: " + moduleId));

        Section draftSection = sectionRepository
                .findBySectionIdAndStatus(published.getSection().getSectionId(), PublishingStatus.DRAFT)
                .orElseThrow(() -> new RuntimeException("Draft section not found: " + published.getSection().getSectionId()));

        Module draft = cloneModule(published, PublishingStatus.DRAFT, published.getVersion() + 1, draftSection, author);
        return moduleRepository.save(draft);
    }

    /**
     * Updates the DRAFT of a module in place (the status sent by the client is ignored).
     */
    @Transactional
    public Optional<Module> updateModule(UUID moduleId, Module moduleDetails) {
        return getModuleByModuleId(moduleId).map(module -> {
            if (moduleDetails.getName() != null) module.setName(moduleDetails.getName());
            if (moduleDetails.getTitle() != null) module.setTitle(moduleDetails.getTitle());
            if (moduleDetails.getIsVisible() != null) module.setIsVisible(moduleDetails.getIsVisible());
            if (moduleDetails.getSortOrder() != null) module.setSortOrder(moduleDetails.getSortOrder());
            return saveDraft(module);
        });
    }

    /**
     * Updates the sort order of a DRAFT module (identified by moduleId or by technical id).
     */
    @Transactional
    public Optional<Module> updateSortOrder(UUID id, Integer sortOrder) {
        return findDraft(id).map(module -> {
            module.setSortOrder(sortOrder);
            return saveDraft(module);
        });
    }

    @Transactional
    public Optional<Module> updateVisibility(UUID moduleId, Boolean isVisible) {
        return findDraft(moduleId).map(module -> {
            module.setIsVisible(isVisible);
            return saveDraft(module);
        });
    }

    /**
     * Saves a modification of a DRAFT: the version is incremented and the status stays DRAFT.
     */
    @Transactional
    public <T extends Module> T saveDraft(T draft) {
        draft.setStatus(PublishingStatus.DRAFT);
        draft.setVersion(draft.getVersion() + 1);
        return moduleRepository.save(draft);
    }

    // ==== DELETE ====

    /**
     * Deletes a module: DRAFT -> DELETED and PUBLISHED -> ARCHIVED.
     */
    @Transactional
    public void softDeleteModule(UUID moduleId) {
        Optional<Module> draft = moduleRepository.findByModuleIdAndStatus(moduleId, PublishingStatus.DRAFT);
        Optional<Module> published = moduleRepository.findByModuleIdAndStatus(moduleId, PublishingStatus.PUBLISHED);

        if (draft.isEmpty() && published.isEmpty()) {
            log.warn("Module not found for deletion: {}", moduleId);
            return;
        }

        draft.ifPresent(d -> {
            d.setStatus(PublishingStatus.DELETED);
            d.setIsVisible(false);
            moduleRepository.save(d);
        });
        published.ifPresent(p -> {
            p.setStatus(PublishingStatus.ARCHIVED);
            p.setIsVisible(false);
            moduleRepository.save(p);
        });
        log.info("Module deleted: {}", moduleId);
    }

    /**
     * Deletes a module from the technical id of one of its rows.
     */
    @Transactional
    public void softDeleteModuleByRowId(UUID id) {
        moduleRepository.findById(id).ifPresent(m -> softDeleteModule(m.getModuleId()));
    }

    /**
     * Logical deletion of the modules attached to a section row (DRAFT -> DELETED, PUBLISHED -> ARCHIVED).
     */
    @Transactional
    public void softDeleteModulesOfSection(Section sectionRow) {
        PublishingStatus status = sectionRow.getStatus();
        for (Module module : moduleRepository.findBySectionRowIdAndStatus(sectionRow.getId(), status)) {
            module.setStatus(status == PublishingStatus.DRAFT ? PublishingStatus.DELETED : PublishingStatus.ARCHIVED);
            module.setIsVisible(false);
            moduleRepository.save(module);
        }
    }

    // ==== CONTENTS & MEDIAS ====

    public java.util.List<Content> getContentsByModuleId(UUID moduleId) {
        return contentRepository.findByOwnerIdAndStatusOrderBySortOrderAsc(moduleId, PublishingStatus.DRAFT);
    }

    /**
     * Creates a DRAFT content for a DRAFT module.
     */
    @Transactional
    public Content createContentForModule(UUID moduleId, CreateContentRequest request, User author) {
        getModuleByModuleId(moduleId)
                .orElseThrow(() -> new RuntimeException("Draft module not found with id: " + moduleId));

        Content content = Content.builder()
                .contentId(UUID.randomUUID())
                .ownerId(moduleId)
                .version(1)
                .status(PublishingStatus.DRAFT)
                .title(request.getTitle())
                .body(request.getBody())
                .sortOrder(request.getSortOrder())
                .isVisible(request.getIsVisible() != null ? request.getIsVisible() : true)
                .author(author)
                .build();

        return contentRepository.save(content);
    }

    public java.util.List<Media> getMediasByModuleId(UUID moduleId) {
        return mediaAttachmentService.getMediasByOwnerId(moduleId);
    }

    public Media attachMediaToModule(UUID moduleId, UUID mediaId, User user) {
        return mediaAttachmentService.attachMediaToOwner(moduleId, mediaId, user);
    }

    public void detachMediaFromModule(UUID moduleId, UUID mediaId) {
        mediaAttachmentService.detachMediaFromOwner(moduleId, mediaId);
    }

    // ==== PUBLICATION ====

    /**
     * Publishes the DRAFT of a module.
     * <p>
     * The PUBLISHED row is created on the first publication, then updated in place. It is attached to the
     * PUBLISHED section, which must therefore exist. The DRAFT stays untouched (it can keep evolving).
     */
    @Transactional
    public Module publishModule(UUID moduleId, User author) {
        Module draft = getModuleByModuleId(moduleId)
                .orElseThrow(() -> new RuntimeException("Draft module not found: " + moduleId));

        Section publishedSection = sectionRepository
                .findBySectionIdAndStatus(draft.getSection().getSectionId(), PublishingStatus.PUBLISHED)
                .orElseThrow(() -> new IllegalStateException(
                        "The section must be published before its modules: " + draft.getSection().getSectionId()));

        Module published = getPublishedModuleByModuleId(moduleId).orElse(null);

        if (published == null) {
            published = cloneModule(draft, PublishingStatus.PUBLISHED, draft.getVersion(), publishedSection, author);
        } else {
            copyModuleData(draft, published);
            published.setSection(publishedSection);
            published.setVersion(draft.getVersion());
            published.setStatus(PublishingStatus.PUBLISHED);
            published.setAuthor(author);
        }

        Module saved = moduleRepository.save(published);
        contentService.publishAllContentsByOwner(moduleId, author);
        log.info("Module published: moduleId={}, version={}", moduleId, saved.getVersion());
        return saved;
    }

    /**
     * Archives the PUBLISHED version of a module (it is no longer displayed on the public site).
     */
    @Transactional
    public void archivePublishedModule(UUID moduleId, User author) {
        Module published = getPublishedModuleByModuleId(moduleId)
                .orElseThrow(() -> new RuntimeException("Published module not found: " + moduleId));

        published.setStatus(PublishingStatus.ARCHIVED);
        published.setIsVisible(false);
        published.setAuthor(author);
        moduleRepository.save(published);
    }

    /**
     * Resets the DRAFT to the PUBLISHED version: module data (including type specific data),
     * version and contents become identical to the published ones.
     */
    @Transactional
    public Module resetDraftToPublished(UUID moduleId, User author) {
        Module published = getPublishedModuleByModuleId(moduleId)
                .orElseThrow(() -> new RuntimeException("Published module not found: " + moduleId));

        Module draft = getModuleByModuleId(moduleId).orElse(null);
        if (draft == null) {
            return createDraftFromPublished(moduleId, author);
        }

        copyModuleData(published, draft);
        draft.setVersion(published.getVersion());
        draft.setAuthor(author);
        Module saved = moduleRepository.save(draft);
        contentService.resetAllContentsByOwner(moduleId, author);
        return saved;
    }

    /**
     * Resets a DRAFT module to its published state, or deletes it when it was never published.
     */
    @Transactional
    public void resetOrDeleteDraft(UUID moduleId, User author) {
        if (getPublishedModuleByModuleId(moduleId).isPresent()) {
            resetDraftToPublished(moduleId, author);
        } else {
            softDeleteModule(moduleId);
        }
    }

    public PublicationInfoDto getPublicationInfo(UUID moduleId) {
        Module draft = getModuleByModuleId(moduleId)
                .orElseThrow(() -> new RuntimeException("Draft module not found: " + moduleId));
        Module published = getPublishedModuleByModuleId(moduleId).orElse(null);
        return new PublicationInfoDto(
                draft.getVersion(),
                draft.getUpdatedAt(),
                published != null ? published.getVersion() : null,
                published != null ? published.getUpdatedAt() : null,
                publicationStatusService.moduleHasUnpublishedChanges(moduleId));
    }

    // ==== COPY ====

    /**
     * Creates a new (unsaved) row of the same type as the source, with the same data.
     */
    public Module cloneModule(Module source, PublishingStatus status, Integer version, Section section, User author) {
        Module target = newInstanceLike(source);
        target.setModuleId(source.getModuleId());
        target.setStatus(status);
        target.setVersion(version);
        target.setSection(section);
        target.setAuthor(author);
        copyModuleData(source, target);
        return target;
    }

    /**
     * Copies the business data of a module (common and type specific) without touching its
     * identity, status, version, section and author.
     */
    public void copyModuleData(Module source, Module target) {
        source = (Module) Hibernate.unproxy(source);
        target = (Module) Hibernate.unproxy(target);

        target.setName(source.getName());
        target.setTitle(source.getTitle());
        target.setType(source.getType());
        target.setSortOrder(source.getSortOrder());
        target.setIsVisible(source.getIsVisible());

        if (source instanceof Article s && target instanceof Article t) {
            t.setVariant(s.getVariant());
            t.setWriter(s.getWriter());
            t.setWritingDate(s.getWritingDate());
        } else if (source instanceof News s && target instanceof News t) {
            t.setVariant(s.getVariant());
            t.setDescription(s.getDescription());
            t.setDetailPageUrl(s.getDetailPageUrl());
            t.setMedia(s.getMedia());
        } else if (source instanceof Newsletter s && target instanceof Newsletter t) {
            t.setVariant(s.getVariant());
            t.setDescription(s.getDescription());
            t.setDetailPageUrl(s.getDetailPageUrl());
            t.setMedia(s.getMedia());
        } else if (source instanceof Gallery s && target instanceof Gallery t) {
            t.setVariant(s.getVariant());
            t.setMedias(s.getMedias() != null ? new ArrayList<>(s.getMedias()) : new ArrayList<>());
        } else if (source instanceof List s && target instanceof List t) {
            t.setVariant(s.getVariant());
            copyListContents(s, t);
        } else if (source instanceof Form s && target instanceof Form t) {
            t.setDescription(s.getDescription());
            t.setMedia(s.getMedia());
            copyFields(s, t);
        } else if (source instanceof Timeline s && target instanceof Timeline t) {
            t.setVariant(s.getVariant());
        } else if (source instanceof CTA s && target instanceof CTA t) {
            t.setLabel(s.getLabel());
            t.setUrl(s.getUrl());
            t.setVariant(s.getVariant());
        }
    }

    private void copyListContents(List source, List target) {
        if (target.getContents() == null) {
            target.setContents(new ArrayList<>());
        }
        // The collection is orphan-removal managed: it must be modified in place
        target.getContents().clear();

        if (source.getContents() == null) {
            return;
        }
        for (ListContent item : source.getContents()) {
            target.getContents().add(ListContent.builder()
                    .list(target)
                    .contentId(item.getContentId())
                    .title(item.getTitle())
                    .body(item.getBody())
                    .isVisible(item.getIsVisible())
                    .sortOrder(item.getSortOrder())
                    .linkUrl(item.getLinkUrl())
                    .medias(item.getMedias() != null ? new ArrayList<>(item.getMedias()) : new ArrayList<>())
                    .build());
        }
    }

    private void copyFields(Form source, Form target) {
        java.util.List<Field> previousFields = target.getFields() != null
                ? new ArrayList<>(target.getFields())
                : new ArrayList<>();

        java.util.List<Field> copies = new ArrayList<>();
        if (source.getFields() != null) {
            for (Field field : source.getFields()) {
                copies.add(Field.builder()
                        .label(field.getLabel())
                        .inputType(field.getInputType())
                        .required(field.getRequired())
                        .placeholder(field.getPlaceholder())
                        .defaultValue(field.getDefaultValue())
                        .options(field.getOptions())
                        .sortOrder(field.getSortOrder())
                        .helpText(field.getHelpText())
                        .isVisible(field.getIsVisible())
                        .build());
            }
        }

        if (target.getFields() == null) {
            target.setFields(new ArrayList<>());
        }
        target.getFields().clear();
        target.getFields().addAll(copies);

        if (!previousFields.isEmpty()) {
            fieldRepository.deleteAll(previousFields);
        }
    }

    private Module newInstanceLike(Module source) {
        source = (Module) Hibernate.unproxy(source);
        if (source instanceof Article) return Article.builder().build();
        if (source instanceof News) return News.builder().build();
        if (source instanceof Newsletter) return Newsletter.builder().build();
        if (source instanceof Gallery) return Gallery.builder().build();
        if (source instanceof List) return List.builder().build();
        if (source instanceof Form) return Form.builder().build();
        if (source instanceof Timeline) return Timeline.builder().build();
        if (source instanceof CTA) return CTA.builder().build();
        return Module.builder().build();
    }

    private Optional<Module> findDraft(UUID id) {
        return moduleRepository.findByModuleIdAndStatus(id, PublishingStatus.DRAFT)
                .or(() -> moduleRepository.findById(id).filter(m -> m.getStatus() == PublishingStatus.DRAFT));
    }
}
