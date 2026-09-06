package com.stemadeleine.api.controller;

import com.stemadeleine.api.model.ListContentMedia;
import com.stemadeleine.api.model.ListContentMedia.ListContentMediaId;
import com.stemadeleine.api.service.ListContentMediaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/list-content-media")
public class ListContentMediaController {

    private final ListContentMediaService listContentMediaService;

    public ListContentMediaController(ListContentMediaService listContentMediaService) {
        this.listContentMediaService = listContentMediaService;
    }

    @GetMapping
    public List<ListContentMedia> getAll() {
        return listContentMediaService.findAll();
    }

    @GetMapping("/{listContentId}/medias/{mediaId}")
    public ResponseEntity<ListContentMedia> getById(
            @PathVariable("listContentId") String listContentId,
            @PathVariable("mediaId") String mediaId
    ) {
        ListContentMediaId id = new ListContentMediaId(
                UUID.fromString(listContentId),
                UUID.fromString(mediaId)
        );
        return listContentMediaService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ListContentMedia create(@RequestBody ListContentMedia listContentMedia) {
        return listContentMediaService.save(listContentMedia);
    }

    @PutMapping("/{listContentId}/medias/{mediaId}")
    public ResponseEntity<ListContentMedia> update(
            @PathVariable("listContentId") String listContentId,
            @PathVariable("mediaId") String mediaId,
            @RequestBody ListContentMedia listContentMedia
    ) {
        ListContentMediaId id = new ListContentMediaId(
                UUID.fromString(listContentId),
                UUID.fromString(mediaId)
        );
        try {
            return ResponseEntity.ok(listContentMediaService.update(id, listContentMedia));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{listContentId}/medias/{mediaId}")
    public ResponseEntity<Void> delete(
            @PathVariable("listContentId") String listContentId,
            @PathVariable("mediaId") String mediaId
    ) {
        ListContentMediaId id = new ListContentMediaId(
                UUID.fromString(listContentId),
                UUID.fromString(mediaId)
        );
        listContentMediaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
