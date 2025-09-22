package com.stemadeleine.api.service;

import com.stemadeleine.api.model.Gallery;
import com.stemadeleine.api.model.Media;
import com.stemadeleine.api.model.MediaAttachable;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.GalleryRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MediaGalleryService {
    private final GalleryRepository galleryRepository;

    @Transactional
    public boolean detachMedia(MediaAttachable entity, UUID mediaId) {
        List<Media> medias = entity.getMedias();
        if (medias != null) {
            boolean removed = medias.removeIf(m -> m.getId().equals(mediaId));
            if (removed) {
                entity.setMedias(medias);
            }
            return removed;
        }
        return false;
    }

    private Gallery getGalleryByModuleIdOrThrow(UUID moduleId) {
        return galleryRepository.findTopByModuleIdOrderByVersionDesc(moduleId)
                .orElseThrow(() -> new RuntimeException("Aucune galerie trouvée pour ce moduleId (" + moduleId + "). Vérifiez que ce module est bien de type Gallery et existe en base."));
    }

    public List<Media> getMediasByOwnerId(UUID ownerId) {
        Gallery gallery = getGalleryByModuleIdOrThrow(ownerId);
        return gallery.getMedias();
    }

    @Transactional
    public Media attachMediaToOwner(UUID ownerId, UUID mediaId, User user) {
        Gallery gallery = getGalleryByModuleIdOrThrow(ownerId);
        List<Media> medias = gallery.getMedias();
        Media media = medias.stream().filter(m -> m.getId().equals(mediaId)).findFirst().orElse(null);
        if (media == null) {
            media = new Media();
            media.setId(mediaId);
            medias.add(media);
            gallery.setMedias(medias);
            galleryRepository.save(gallery);
        }
        return media;
    }

    @Transactional
    public void detachMediaFromOwner(UUID ownerId, UUID mediaId) {
        Gallery gallery = getGalleryByModuleIdOrThrow(ownerId);
        List<Media> medias = gallery.getMedias();
        boolean removed = medias.removeIf(m -> m.getId().equals(mediaId));
        if (removed) {
            gallery.setMedias(medias);
            galleryRepository.save(gallery);
        }
    }
}
