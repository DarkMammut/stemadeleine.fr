package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.*;
import com.stemadeleine.api.mapper.GalleryMapper;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.service.GalleryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/galleries")
@RequiredArgsConstructor
public class GalleryController {
    private final GalleryService galleryService;
    private final GalleryMapper galleryMapper;

    @GetMapping
    public List<GalleryDto> getAllGalleries() {
        log.info("GET /api/galleries - Retrieving all galleries");
        List<Gallery> galleries = galleryService.getAllGalleries();
        log.debug("Number of galleries found: {}", galleries.size());
        return galleries.stream().map(galleryMapper::toDto).toList();
    }

    @GetMapping("/variants")
    public ResponseEntity<List<String>> getGalleryVariants() {
        log.info("GET /api/galleries/variants - Retrieving available gallery variants");
        List<String> variants = Arrays.stream(GalleryVariants.values())
                .map(Enum::name)
                .collect(Collectors.toList());
        log.debug("Gallery variants: {}", variants);
        return ResponseEntity.ok(variants);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GalleryDto> getGalleryById(@PathVariable UUID id) {
        log.info("GET /api/galleries/{} - Retrieving gallery by ID", id);
        return galleryService.getGalleryById(id)
                .map(gallery -> {
                    log.debug("Gallery found: {}", gallery.getId());
                    return ResponseEntity.ok(galleryMapper.toDto(gallery));
                })
                .orElseGet(() -> {
                    log.warn("Gallery not found with ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @GetMapping("/by-module-id/{moduleId}")
    public ResponseEntity<GalleryDto> getGalleryByModuleId(@PathVariable UUID moduleId) {
        log.info("GET /api/galleries/by-module-id/{} - Retrieving latest gallery version by moduleId", moduleId);
        return galleryService.getLastVersionByModuleId(moduleId)
                .map(gallery -> {
                    log.debug("Gallery found: {} (version {})", gallery.getId(), gallery.getVersion());
                    return ResponseEntity.ok(galleryMapper.toDto(gallery));
                })
                .orElseGet(() -> {
                    log.warn("Gallery not found with moduleId: {}", moduleId);
                    return ResponseEntity.notFound().build();
                });
    }

    @PostMapping
    public ResponseEntity<GalleryDto> createGallery(
            @RequestBody CreateModuleRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            log.error("Attempt to create gallery without authentication");
            throw new RuntimeException("User not authenticated");
        }
        User currentUser = currentUserDetails.account().getUser();
        log.info("POST /api/galleries - Creating a new gallery");
        Gallery gallery = galleryService.createGalleryWithModule(
                request,
                currentUser
        );
        log.debug("Gallery created with ID: {}", gallery.getId());
        return ResponseEntity.ok(galleryMapper.toDto(gallery));
    }

    @PostMapping("/version")
    public ResponseEntity<GalleryDto> createNewVersionForModule(
            @RequestBody CreateGalleryVersionRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails) {
        if (currentUserDetails == null) {
            throw new RuntimeException("User not authenticated");
        }
        User currentUser = currentUserDetails.account().getUser();
        log.info("POST /api/gallery/version - Creating a new version for module: {}", request.moduleId());
        Gallery gallery = galleryService.createGalleryVersion(request, currentUser);
        log.debug("New version created with ID: {}", gallery.getId());
        return ResponseEntity.ok(galleryMapper.toDto(gallery));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GalleryDto> updateGallery(
            @PathVariable UUID id,
            @RequestBody UpdateGalleryRequest request) {
        log.info("PUT /api/galleries/{} - Updating a gallery", id);
        try {
            Gallery updatedGallery = galleryService.updateGallery(id, request);
            log.debug("Gallery updated: {}", updatedGallery.getId());
            return ResponseEntity.ok(galleryMapper.toDto(updatedGallery));
        } catch (RuntimeException e) {
            log.error("Error updating gallery {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGallery(@PathVariable UUID id) {
        galleryService.softDeleteGallery(id);
        log.debug("Gallery deleted: {}", id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{moduleId}/medias")
    public ResponseEntity<List<Media>> getMedias(@PathVariable UUID moduleId) {
        Gallery gallery = galleryService.getLastVersionByModuleId(moduleId)
                .orElseThrow(() -> new RuntimeException("Gallery not found with moduleId: " + moduleId));
        return ResponseEntity.ok(gallery.getMedias());
    }

    @PostMapping("/{moduleId}/medias")
    public ResponseEntity<Media> attachMediaToGallery(
            @PathVariable UUID moduleId,
            @RequestBody AttachMediaRequest request) {
        Media media = galleryService.attachMedia(moduleId, request.mediaId());
        return ResponseEntity.ok(media);
    }

    @DeleteMapping("/{moduleId}/medias/{mediaId}")
    public ResponseEntity<Void> detachMediaFromGallery(
            @PathVariable UUID moduleId,
            @PathVariable UUID mediaId) {
        galleryService.detachMedia(moduleId, mediaId);
        return ResponseEntity.noContent().build();
    }
}
