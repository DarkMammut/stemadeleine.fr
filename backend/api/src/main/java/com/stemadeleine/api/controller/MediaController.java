package com.stemadeleine.api.controller;

import com.stemadeleine.api.model.Media;
import com.stemadeleine.api.repository.MediaRepository;
import com.stemadeleine.api.service.MediaService;
import com.stemadeleine.api.service.SupabaseStorageClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    @Autowired
    private SupabaseStorageClient storageClient;

    private final MediaRepository mediaRepository;
    private final MediaService mediaService;

    public MediaController(MediaService mediaService, MediaRepository mediaRepository) {
        this.mediaService = mediaService;
        this.mediaRepository = mediaRepository;
    }

    @GetMapping
    public List<Media> getAll() {
        return mediaService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Media> getById(@PathVariable UUID id) {
        return mediaService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/visible")
    public List<Media> getVisible() {
        return mediaService.findVisible();
    }

    @PostMapping
    public Media create(@RequestBody Media media) {
        return mediaService.save(media);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Media> update(@PathVariable UUID id, @RequestBody Media media) {
        try {
            return ResponseEntity.ok(mediaService.update(id, media));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        mediaService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadMedia(@RequestParam("file") MultipartFile file) {
        try {
            String filename = System.currentTimeMillis() + "-" + file.getOriginalFilename();

            storageClient.uploadFile(
                    "medias-dev",
                    filename,
                    file.getInputStream(),
                    file.getSize(),
                    file.getContentType()
            );

            String publicUrl = storageClient.getPublicUrl("medias-dev", filename);

            Media media = new Media();
            media.setFileUrl(publicUrl);
            media.setTitle(file.getOriginalFilename());
            media.setAltText(file.getOriginalFilename());
            media.setIsVisible(true);

            Media savedMedia = mediaRepository.save(media);

            return ResponseEntity.ok(savedMedia);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erreur lors de l'upload");
        }
    }


}
