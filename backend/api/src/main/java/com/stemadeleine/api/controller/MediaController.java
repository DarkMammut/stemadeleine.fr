package com.stemadeleine.api.controller;

import com.stemadeleine.api.model.Media;
import com.stemadeleine.api.service.MediaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    private final MediaService mediaService;

    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
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
}
