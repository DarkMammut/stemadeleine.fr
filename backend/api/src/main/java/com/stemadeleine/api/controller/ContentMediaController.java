package com.stemadeleine.api.controller;

import com.stemadeleine.api.model.ContentMedia;
import com.stemadeleine.api.model.ContentMedia.ContentMediaId;
import com.stemadeleine.api.service.ContentMediaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/content-media")
public class ContentMediaController {

    private final ContentMediaService contentMediaService;

    public ContentMediaController(ContentMediaService contentMediaService) {
        this.contentMediaService = contentMediaService;
    }

    @GetMapping
    public List<ContentMedia> getAll() {
        return contentMediaService.findAll();
    }

    @GetMapping("/{contentId}/{mediaId}")
    public ResponseEntity<ContentMedia> getById(
            @PathVariable("contentId") String contentId,
            @PathVariable("mediaId") String mediaId
    ) {
        ContentMediaId id = new ContentMediaId(
                java.util.UUID.fromString(contentId),
                java.util.UUID.fromString(mediaId)
        );
        return contentMediaService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ContentMedia create(@RequestBody ContentMedia contentMedia) {
        return contentMediaService.save(contentMedia);
    }

    @PutMapping("/{contentId}/{mediaId}")
    public ResponseEntity<ContentMedia> update(
            @PathVariable("contentId") String contentId,
            @PathVariable("mediaId") String mediaId,
            @RequestBody ContentMedia contentMedia
    ) {
        ContentMediaId id = new ContentMediaId(
                java.util.UUID.fromString(contentId),
                java.util.UUID.fromString(mediaId)
        );
        try {
            return ResponseEntity.ok(contentMediaService.update(id, contentMedia));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{contentId}/{mediaId}")
    public ResponseEntity<Void> delete(
            @PathVariable("contentId") String contentId,
            @PathVariable("mediaId") String mediaId
    ) {
        ContentMediaId id = new ContentMediaId(
                java.util.UUID.fromString(contentId),
                java.util.UUID.fromString(mediaId)
        );
        contentMediaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
