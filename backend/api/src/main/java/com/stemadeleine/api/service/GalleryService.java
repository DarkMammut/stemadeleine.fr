package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateGalleryRequest;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.repository.GalleryRepository;
import com.stemadeleine.api.repository.MediaRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
    private final ModuleService moduleService;
    private final MediaRepository mediaRepository;

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

    @Transactional
    public Gallery updateGallery(UUID id, Gallery galleryDetails) {
        log.info("Mise à jour de la galerie avec l'ID : {}", id);
        return galleryRepository.findById(id)
                .map(gallery -> {
                    gallery.setName(galleryDetails.getName());
                    gallery.setSortOrder(galleryDetails.getSortOrder());
                    gallery.setIsVisible(galleryDetails.getIsVisible());
                    gallery.setVariant(galleryDetails.getVariant());
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

    public Gallery createGalleryWithModule(CreateGalleryRequest request, User author) {
        log.info("Création d'une nouvelle galerie pour la section : {}", request.sectionId());

        Module module = moduleService.createNewModule(
                request.sectionId(),
                request.name(),
                "GALLERY",
                author
        );
        log.debug("Module créé avec l'ID : {}", module.getId());

        Gallery gallery = Gallery.builder()
                .moduleId(module.getModuleId())
                .section(module.getSection())
                .name(module.getName())
                .title(module.getTitle())
                .type(module.getType())
                .sortOrder(module.getSortOrder())
                .isVisible(module.getIsVisible())
                .status(module.getStatus())
                .author(author)
                .version(1)
                .variant(GalleryVariants.GRID)
                .medias(new ArrayList<>())  // Initialisation d'une liste vide de médias
                .build();

        Gallery savedGallery = galleryRepository.save(gallery);
        log.info("Galerie créée avec succès, ID : {}", savedGallery.getId());
        return savedGallery;
    }

    @Transactional
    public Gallery addMediaToGallery(UUID galleryId, Media media) {
        log.info("Ajout d'un média à la galerie : {}", galleryId);
        return galleryRepository.findById(galleryId)
                .map(gallery -> {
                    Media savedMedia = mediaRepository.save(media);
                    List<Media> medias = gallery.getMedias();
                    medias.add(savedMedia);
                    gallery.setMedias(medias);
                    Gallery updatedGallery = galleryRepository.save(gallery);
                    log.debug("Média ajouté avec succès à la galerie");
                    return updatedGallery;
                })
                .orElseThrow(() -> {
                    log.error("Galerie non trouvée avec l'ID : {}", galleryId);
                    return new RuntimeException("Gallery not found");
                });
    }
}
