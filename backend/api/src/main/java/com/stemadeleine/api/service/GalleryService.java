package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateModuleRequest;
import com.stemadeleine.api.dto.UpdateGalleryRequest;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.repository.GalleryRepository;
import com.stemadeleine.api.repository.MediaRepository;
import com.stemadeleine.api.repository.SectionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

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
    private final @Lazy ModuleService moduleService;
    private final SectionRepository sectionRepository;

    public List<Gallery> getAllGalleries() {
        log.info("Récupération de toutes les galeries non supprimées");
        List<Gallery> galleries = galleryRepository.findByStatusNot(PublishingStatus.DELETED);
        log.debug("Nombre de galeries trouvées : {}", galleries.size());
        return galleries;
    }

    public Optional<Gallery> getGalleryById(UUID id) {
        log.info("Recherche de la galerie avec l'ID : {}", id);
        Optional<Gallery> gallery = galleryRepository.findById(id)
                .filter(g -> g.getStatus() != PublishingStatus.DELETED);
        log.debug("Galerie trouvée : {}", gallery.isPresent());
        return gallery;
    }

    public Optional<Gallery> getLastVersionByModuleId(UUID moduleId) {
        return galleryRepository.findTopByModuleIdOrderByVersionDesc(moduleId)
                .filter(g -> g.getStatus() != PublishingStatus.DELETED);
    }

    @Transactional
    public Gallery updateGallery(UUID id, Gallery galleryDetails) {
        log.info("Mise à jour de la galerie avec l'ID : {}", id);
        return galleryRepository.findById(id)
                .map(gallery -> {
                    gallery.setName(galleryDetails.getName());
                    gallery.setSortOrder(galleryDetails.getSortOrder());
                    gallery.setIsVisible(galleryDetails.getIsVisible());
                    gallery.setVariant(galleryDetails.getVariant() != null ? galleryDetails.getVariant() : GalleryVariants.GRID);
                    gallery.setTitle(galleryDetails.getTitle());
                    if (galleryDetails.getMedias() != null) {
                        gallery.setMedias(galleryDetails.getMedias());
                    }
                    log.debug("Galerie mise à jour : {}", gallery);
                    return galleryRepository.save(gallery);
                })
                .orElseThrow(() -> {
                    log.error("Galerie non trouvée avec l'ID : {}", id);
                    return new RuntimeException("Gallery not found");
                });
    }

    public void softDeleteGallery(UUID id) {
        log.info("Suppression logique de la galerie avec l'ID : {}", id);
        galleryRepository.findById(id).ifPresent(gallery -> {
            gallery.setStatus(PublishingStatus.DELETED);
            galleryRepository.save(gallery);
            log.debug("Galerie marquée comme supprimée : {}", id);
        });
    }

    public Gallery createGalleryWithModule(CreateModuleRequest request, User author) {
        log.info("Création d'une nouvelle galerie pour la section : {}", request.sectionId());

        // Récupérer la section à partir de l'UUID
        Section section = sectionRepository.findTopBySectionIdOrderByVersionDesc(request.sectionId())
                .orElseThrow(() -> new RuntimeException("Section not found for id: " + request.sectionId()));

        // Créer directement la gallery (hérite de Module)
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

        Gallery savedGallery = galleryRepository.save(gallery);
        log.info("Galerie créée avec succès, ID : {}", savedGallery.getId());
        return savedGallery;
    }

    public Gallery createGalleryVersion(UpdateGalleryRequest request, User author) {
        log.info("Création d'une nouvelle version de Gallery pour le moduleId : {}", request.moduleId());

        // 1. Récupérer le module (pour structure ou fallback)
        Module module = moduleService.getModuleByModuleId(request.moduleId())
                .orElseThrow(() -> new RuntimeException("Module not found for id: " + request.moduleId()));

        // 2. Récupérer la dernière version du Gallery pour ce module
        Gallery previousGallery = galleryRepository.findTopByModuleIdOrderByVersionDesc(request.moduleId()).orElse(null);

        // 3. Fusionner les infos du request et de la version précédente
        String name = request.name() != null ? request.name() : (previousGallery != null ? previousGallery.getName() : module.getName());
        String title = request.title() != null ? request.title() : (previousGallery != null ? previousGallery.getTitle() : module.getTitle());
        GalleryVariants variant = request.variant() != null ? request.variant() : (previousGallery != null ? previousGallery.getVariant() : GalleryVariants.GRID);
        List<Media> medias = previousGallery != null && previousGallery.getMedias() != null
                ? new ArrayList<>(previousGallery.getMedias())
                : new ArrayList<>();
        String type = module.getType();
        Integer sortOrder = module.getSortOrder();
        Boolean isVisible = module.getIsVisible();
        PublishingStatus status = PublishingStatus.DRAFT;
        int newVersion = previousGallery != null ? previousGallery.getVersion() + 1 : 1;

        Gallery gallery = Gallery.builder()
                .moduleId(module.getModuleId())
                .name(name)
                .title(title)
                .variant(variant)
                .medias(medias)
                .author(author)
                .type(type)
                .sortOrder(sortOrder)
                .isVisible(isVisible)
                .status(status)
                .version(newVersion)
                .build();

        Gallery savedGallery = galleryRepository.save(gallery);
        log.info("Nouvelle version de Gallery créée avec succès, ID : {}", savedGallery.getId());
        return savedGallery;
    }

    public List<Media> getMedias(UUID moduleId) {
        Gallery gallery = galleryRepository.findTopByModuleIdOrderByVersionDesc(moduleId)
                .orElseThrow(() -> new RuntimeException("Gallery not found with moduleId: " + moduleId));
        // Force l'initialisation de la liste des médias pour éviter les problèmes de proxy Hibernate
        Hibernate.initialize(gallery.getMedias());
        return gallery.getMedias();
    }

    @Transactional
    public Media attachMedia(UUID moduleId, UUID mediaId) {
        Gallery gallery = galleryRepository.findTopByModuleIdOrderByVersionDesc(moduleId)
                .orElseThrow(() -> new RuntimeException("Gallery not found with moduleId: " + moduleId));
        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new RuntimeException("Media not found with id: " + mediaId));
        List<Media> medias = gallery.getMedias();
        if (medias == null) {
            medias = new ArrayList<>();
        }
        if (medias.stream().noneMatch(m -> m.getId().equals(mediaId))) {
            medias.add(media);
            gallery.setMedias(medias);
            galleryRepository.save(gallery);
        }
        return media;
    }

    @Transactional
    public void detachMedia(UUID moduleId, UUID mediaId) {
        Gallery gallery = getLastVersionByModuleId(moduleId)
                .orElseThrow(() -> new RuntimeException("Gallery not found with moduleId: " + moduleId));
        List<Media> medias = gallery.getMedias();
        if (medias != null && medias.removeIf(m -> m.getId().equals(mediaId))) {
            gallery.setMedias(medias);
            galleryRepository.save(gallery);
        }
    }
}
