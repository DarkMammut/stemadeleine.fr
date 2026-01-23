package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.CreateMediaRequest;
import com.stemadeleine.api.dto.MediaDto;
import com.stemadeleine.api.mapper.MediaMapper;
import com.stemadeleine.api.model.Media;
import com.stemadeleine.api.service.MediaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
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
        log.info("GET /api/media - Retrieving all media");
        List<Media> medias = mediaService.getAllMedia();
        List<MediaDto> mediaDtos = medias.stream().map(mediaMapper::toDto).toList();
        log.debug("Number of media found: {}", mediaDtos.size());
        return ResponseEntity.ok(mediaDtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MediaDto> getMediaById(@PathVariable UUID id) {
        log.info("GET /api/media/{} - Retrieving media by ID", id);
        return mediaService.getMediaById(id)
                .map(media -> {
                    log.debug("Media found: {}", media.getId());
                    return ResponseEntity.ok(mediaMapper.toDto(media));
                })
                .orElseGet(() -> {
                    log.warn("Media not found with ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @PostMapping
    public ResponseEntity<MediaDto> createMedia(@RequestBody CreateMediaRequest request) {
        log.info("POST /api/media - Creating a new media");
        Media media = mediaService.createMedia(request);
        log.debug("Media created with ID: {}", media.getId());
        return ResponseEntity.ok(mediaMapper.toDto(media));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MediaDto> updateMedia(@PathVariable UUID id, @RequestBody Media mediaDetails) {
        log.info("PUT /api/media/{} - Updating media", id);
        return mediaService.updateMedia(id, mediaDetails)
                .map(media -> {
                    log.debug("Media updated: {}", media.getId());
                    return ResponseEntity.ok(mediaMapper.toDto(media));
                })
                .orElseGet(() -> {
                    log.warn("Media not found with ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedia(@PathVariable UUID id) {
        log.info("DELETE /api/media/{} - Deleting media", id);
        mediaService.deleteMedia(id);
        log.debug("Media deleted: {}", id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<MediaDto>> searchMedia(@RequestParam String query) {
        log.info("GET /api/media/search - Searching media with term: {}", query);
        List<Media> medias = mediaService.searchMedia(query);
        List<MediaDto> mediaDtos = medias.stream().map(mediaMapper::toDto).toList();
        log.debug("Number of media found: {}", mediaDtos.size());
        return ResponseEntity.ok(mediaDtos);
    }

    @PutMapping("/{id}/sort-order")
    public ResponseEntity<MediaDto> updateSortOrder(@PathVariable UUID id, @RequestBody Integer sortOrder) {
        log.info("PUT /api/media/{}/sort-order - Updating sort order of media", id);
        return mediaService.updateSortOrder(id, sortOrder)
                .map(media -> {
                    log.debug("Sort order updated for media: {}", media.getId());
                    return ResponseEntity.ok(mediaMapper.toDto(media));
                })
                .orElseGet(() -> {
                    log.warn("Media not found with ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MediaDto> uploadMedia(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "altText", required = false) String altText) {
        log.info("POST /api/media/upload - Uploading file: {}", file.getOriginalFilename());

        try {
            Media media = mediaService.uploadMedia(file, title, altText);
            log.debug("File uploaded successfully: {}", media.getId());
            return ResponseEntity.ok(mediaMapper.toDto(media));
        } catch (Exception e) {
            log.error("Error uploading file: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}
