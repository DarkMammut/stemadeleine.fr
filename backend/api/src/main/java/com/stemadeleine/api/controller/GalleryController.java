package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.CreateGalleryRequest;
import com.stemadeleine.api.dto.GalleryDto;
import com.stemadeleine.api.mapper.GalleryMapper;
import com.stemadeleine.api.model.CustomUserDetails;
import com.stemadeleine.api.model.Gallery;
import com.stemadeleine.api.service.GalleryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/galleries")
@RequiredArgsConstructor
public class GalleryController {
    private final GalleryService galleryService;
    private final GalleryMapper galleryMapper;

    @GetMapping
    public List<GalleryDto> getAllGalleries() {
        log.info("GET /api/galleries - Récupération de toutes les galeries");
        List<Gallery> galleries = galleryService.getAllGalleries();
        log.debug("Nombre de galeries trouvées : {}", galleries.size());
        return galleries.stream().map(galleryMapper::toDto).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<GalleryDto> getGalleryById(@PathVariable UUID id) {
        log.info("GET /api/galleries/{} - Récupération d'une galerie par ID", id);
        return galleryService.getGalleryById(id)
                .map(gallery -> {
                    log.debug("Galerie trouvée : {}", gallery.getId());
                    return ResponseEntity.ok(galleryMapper.toDto(gallery));
                })
                .orElseGet(() -> {
                    log.warn("Galerie non trouvée avec l'ID : {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @PostMapping
    public ResponseEntity<GalleryDto> createGallery(
            @RequestBody CreateGalleryRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            log.error("Tentative de création de galerie sans authentification");
            throw new RuntimeException("User not authenticated");
        }

        log.info("POST /api/galleries - Création d'une nouvelle galerie");
        Gallery gallery = galleryService.createGalleryWithModule(
                request,
                currentUserDetails.account().getUser()
        );
        log.debug("Galerie créée avec l'ID : {}", gallery.getId());
        return ResponseEntity.ok(galleryMapper.toDto(gallery));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GalleryDto> updateGallery(@PathVariable UUID id, @RequestBody Gallery galleryDetails) {
        log.info("PUT /api/galleries/{} - Mise à jour d'une galerie", id);
        try {
            Gallery updatedGallery = galleryService.updateGallery(id, galleryDetails);
            log.debug("Galerie mise à jour : {}", updatedGallery.getId());
            return ResponseEntity.ok(galleryMapper.toDto(updatedGallery));
        } catch (RuntimeException e) {
            log.error("Erreur lors de la mise à jour de la galerie {} : {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGallery(@PathVariable UUID id) {
        log.info("DELETE /api/galleries/{} - Suppression d'une galerie", id);
        galleryService.softDeleteGallery(id);
        log.debug("Galerie supprimée : {}", id);
        return ResponseEntity.noContent().build();
    }
}
