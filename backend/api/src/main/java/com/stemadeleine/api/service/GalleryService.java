package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateGalleryVersionRequest;
import com.stemadeleine.api.dto.CreateModuleRequest;
import com.stemadeleine.api.dto.UpdateGalleryRequest;
import com.stemadeleine.api.model.Gallery;
import com.stemadeleine.api.model.GalleryVariants;
import com.stemadeleine.api.model.Media;
import com.stemadeleine.api.model.PublishingStatus;
import com.stemadeleine.api.model.Section;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.GalleryRepository;
import com.stemadeleine.api.repository.MediaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class GalleryService {
    private final GalleryRepository galleryRepository;
    private final MediaRepository mediaRepository;
    private final ModuleService moduleService;

    public List<Gallery> getAllGalleries() {
        return galleryRepository.findByStatus(PublishingStatus.DRAFT);
    }

    public Optional<Gallery> getGalleryById(UUID id) {
        return galleryRepository.findById(id)
                .filter(g -> g.getStatus() == PublishingStatus.DRAFT || g.getStatus() == PublishingStatus.PUBLISHED);
    }

    /**
     * DRAFT of a gallery (backoffice).
     */
    public Optional<Gallery> getLastVersionByModuleId(UUID moduleId) {
        return galleryRepository.findByModuleIdAndStatus(moduleId, PublishingStatus.DRAFT);
    }

    /**
     * PUBLISHED version of a gallery (public site).
     */
    public Optional<Gallery> getPublishedByModuleId(UUID moduleId) {
        return galleryRepository.findByModuleIdAndStatus(moduleId, PublishingStatus.PUBLISHED);
    }

    @Transactional
    public Gallery updateGallery(UUID id, UpdateGalleryRequest request) {
        Gallery gallery = moduleService.findDraftByRowId(galleryRepository, id)
                .orElseThrow(() -> new RuntimeException("Gallery not found"));

        if (request.getName() != null) gallery.setName(request.getName());
        if (request.getTitle() != null) gallery.setTitle(request.getTitle());
        if (request.getVariant() != null) gallery.setVariant(request.getVariant());
        if (request.getSortOrder() != null) gallery.setSortOrder(request.getSortOrder());

        return moduleService.saveDraft(gallery);
    }

    @Transactional
    public void softDeleteGallery(UUID id) {
        moduleService.softDeleteModuleByRowId(id);
    }

    @Transactional
    public Gallery createGalleryWithModule(CreateModuleRequest request, User author) {
        Section section = moduleService.getDraftSection(request.sectionId());

        Gallery gallery = Gallery.builder()
                .moduleId(UUID.randomUUID())
                .section(section)
                .name(request.name())
                .title(request.name())
                .type("GALLERY")
                .sortOrder(0)
                .isVisible(false)
                .status(PublishingStatus.DRAFT)
                .author(author)
                .version(1)
                .variant(GalleryVariants.GRID)
                .medias(new ArrayList<>())
                .build();

        return galleryRepository.save(gallery);
    }

    /**
     * Updates the DRAFT of the gallery in place (no new row).
     */
    @Transactional
    public Gallery createGalleryVersion(CreateGalleryVersionRequest request, User author) {
        Gallery gallery = getLastVersionByModuleId(request.moduleId())
                .orElseThrow(() -> new RuntimeException("Draft gallery not found for moduleId: " + request.moduleId()));

        if (request.name() != null) gallery.setName(request.name());
        if (request.title() != null) gallery.setTitle(request.title());
        if (request.variant() != null) gallery.setVariant(request.variant());
        gallery.setAuthor(author);

        return moduleService.saveDraft(gallery);
    }

    @Transactional
    public List<Media> getMedias(UUID moduleId) {
        Gallery gallery = getDraftOrThrow(moduleId);
        // Force l'initialisation de la liste des médias pour éviter les problèmes de proxy Hibernate
        Hibernate.initialize(gallery.getMedias());
        return gallery.getMedias();
    }

    @Transactional
    public Media attachMedia(UUID moduleId, UUID mediaId) {
        Gallery gallery = getDraftOrThrow(moduleId);
        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new RuntimeException("Media not found with id: " + mediaId));

        List<Media> medias = gallery.getMedias() != null ? gallery.getMedias() : new ArrayList<>();
        if (medias.stream().noneMatch(m -> m.getId().equals(mediaId))) {
            media.setSortOrder(Media.nextSortOrder(medias));
            medias.add(media);
            gallery.setMedias(medias);
            moduleService.saveDraft(gallery);
        }
        return media;
    }

    @Transactional
    public void detachMedia(UUID moduleId, UUID mediaId) {
        Gallery gallery = getDraftOrThrow(moduleId);
        List<Media> medias = gallery.getMedias();
        if (medias != null && medias.removeIf(m -> m.getId().equals(mediaId))) {
            gallery.setMedias(medias);
            moduleService.saveDraft(gallery);
        }
    }

    private Gallery getDraftOrThrow(UUID moduleId) {
        return getLastVersionByModuleId(moduleId)
                .orElseThrow(() -> new RuntimeException("Gallery not found with moduleId: " + moduleId));
    }
}
