package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.CreateMediaRequest;
import com.stemadeleine.api.dto.MediaDto;
import com.stemadeleine.api.mapper.MediaMapper;
import com.stemadeleine.api.model.Media;
import com.stemadeleine.api.service.MediaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {
    private final MediaService mediaService;
    private final MediaMapper mediaMapper;

    @GetMapping
    public ResponseEntity<List<MediaDto>> getAllMedia() {
        log.info("GET /api/media - Récupération de tous les médias");
        List<Media> medias = mediaService.getAllMedia();
        List<MediaDto> mediaDtos = medias.stream().map(mediaMapper::toDto).toList();
        log.debug("Nombre de médias trouvés : {}", mediaDtos.size());
        return ResponseEntity.ok(mediaDtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MediaDto> getMediaById(@PathVariable UUID id) {
        log.info("GET /api/media/{} - Récupération d'un média par ID", id);
        return mediaService.getMediaById(id)
                .map(media -> {
                    log.debug("Média trouvé : {}", media.getId());
                    return ResponseEntity.ok(mediaMapper.toDto(media));
                })
                .orElseGet(() -> {
                    log.warn("Média non trouvé avec l'ID : {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @PostMapping
    public ResponseEntity<MediaDto> createMedia(@RequestBody CreateMediaRequest request) {
        log.info("POST /api/media - Création d'un nouveau média");
        Media media = mediaService.createMedia(request);
        log.debug("Média créé avec l'ID : {}", media.getId());
        return ResponseEntity.ok(mediaMapper.toDto(media));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MediaDto> updateMedia(@PathVariable UUID id, @RequestBody Media mediaDetails) {
        log.info("PUT /api/media/{} - Mise à jour d'un média", id);
        return mediaService.updateMedia(id, mediaDetails)
                .map(media -> {
                    log.debug("Média mis à jour : {}", media.getId());
                    return ResponseEntity.ok(mediaMapper.toDto(media));
                })
                .orElseGet(() -> {
                    log.warn("Média non trouvé avec l'ID : {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedia(@PathVariable UUID id) {
        log.info("DELETE /api/media/{} - Suppression d'un média", id);
        mediaService.deleteMedia(id);
        log.debug("Média supprimé : {}", id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<MediaDto>> searchMedia(@RequestParam String query) {
        log.info("GET /api/media/search - Recherche de médias avec le terme : {}", query);
        List<Media> medias = mediaService.searchMedia(query);
        List<MediaDto> mediaDtos = medias.stream().map(mediaMapper::toDto).toList();
        log.debug("Nombre de médias trouvés : {}", mediaDtos.size());
        return ResponseEntity.ok(mediaDtos);
    }

    @PutMapping("/{id}/sort-order")
    public ResponseEntity<MediaDto> updateSortOrder(@PathVariable UUID id, @RequestBody Integer sortOrder) {
        log.info("PUT /api/media/{}/sort-order - Mise à jour de l'ordre de tri d'un média", id);
        return mediaService.updateSortOrder(id, sortOrder)
                .map(media -> {
                    log.debug("Ordre de tri mis à jour pour le média : {}", media.getId());
                    return ResponseEntity.ok(mediaMapper.toDto(media));
                })
                .orElseGet(() -> {
                    log.warn("Média non trouvé avec l'ID : {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @PostMapping("/upload")
    public ResponseEntity<MediaDto> uploadMedia(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "altText", required = false) String altText) {
        log.info("POST /api/media/upload - Upload d'un fichier : {}", file.getOriginalFilename());

        try {
            Media media = mediaService.uploadMedia(file, title, altText);
            log.debug("Fichier uploadé avec succès : {}", media.getId());
            return ResponseEntity.ok(mediaMapper.toDto(media));
        } catch (Exception e) {
            log.error("Erreur lors de l'upload du fichier : {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}
