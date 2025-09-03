package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.CreateGalleryRequest;
import com.stemadeleine.api.dto.GalleryDto;
import com.stemadeleine.api.mapper.GalleryMapper;
import com.stemadeleine.api.model.CustomUserDetails;
import com.stemadeleine.api.model.Gallery;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.service.GalleryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/galleries")
@RequiredArgsConstructor
public class GalleryController {
    private final GalleryService galleryService;
    private final GalleryMapper galleryMapper;

    @GetMapping
    public List<GalleryDto> getAllGalleries() {
        return galleryService.getAllGalleries().stream().map(galleryMapper::toDto).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<GalleryDto> getGalleryById(@PathVariable UUID id) {
        return galleryService.getGalleryById(id)
                .map(galleryMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<GalleryDto> createGallery(@RequestBody CreateGalleryRequest request, @AuthenticationPrincipal CustomUserDetails currentUserDetails) {
        if (currentUserDetails == null) {
            throw new RuntimeException("User not authenticated");
        }
        User currentUser = currentUserDetails.account().getUser();
        Gallery gallery = galleryService.createGalleryWithModule(request, currentUser);
        return ResponseEntity.ok(galleryMapper.toDto(gallery));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GalleryDto> updateGallery(@PathVariable UUID id, @RequestBody Gallery details) {
        try {
            return ResponseEntity.ok(galleryMapper.toDto(galleryService.updateGallery(id, details)));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGallery(@PathVariable UUID id) {
        galleryService.softDeleteGallery(id);
        return ResponseEntity.noContent().build();
    }
}

