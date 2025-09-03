package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateGalleryRequest;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.repository.GalleryRepository;
import com.stemadeleine.api.repository.MediaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GalleryService {
    private final GalleryRepository galleryRepository;
    private final ModuleService moduleService;
    private final MediaRepository mediaRepository;

    public List<Gallery> getAllGalleries() {
        return galleryRepository.findByStatusNot(PublishingStatus.DELETED);
    }

    public Optional<Gallery> getGalleryById(UUID id) {
        return galleryRepository.findById(id)
                .filter(gallery -> gallery.getStatus() != PublishingStatus.DELETED);
    }

    public Gallery updateGallery(UUID id, Gallery galleryDetails) {
        return galleryRepository.findById(id)
                .map(gallery -> {
                    gallery.setName(galleryDetails.getName());
                    gallery.setSortOrder(galleryDetails.getSortOrder());
                    gallery.setIsVisible(galleryDetails.getIsVisible());
                    gallery.setVariant(galleryDetails.getVariant());
                    gallery.setMedias(galleryDetails.getMedias());
                    return galleryRepository.save(gallery);
                })
                .orElseThrow(() -> new RuntimeException("Gallery not found"));
    }

    public void softDeleteGallery(UUID id) {
        galleryRepository.findById(id).ifPresent(gallery -> {
            gallery.setStatus(PublishingStatus.DELETED);
            galleryRepository.save(gallery);
        });
    }

    public Gallery createGalleryWithModule(CreateGalleryRequest request, User author) {
        Module module = moduleService.createNewModule(
                request.sectionId(),
                request.name(),
                "GALLERY",
                author
        );

        Gallery gallery = Gallery.builder()
                .variant(GalleryVariants.GRID)
                .build();
        return galleryRepository.save(gallery);
    }
}

