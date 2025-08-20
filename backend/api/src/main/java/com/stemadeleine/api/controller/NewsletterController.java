package com.stemadeleine.api.controller;

import com.stemadeleine.api.model.Newsletter;
import com.stemadeleine.api.service.NewsletterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/newsletter")
public class NewsletterController {

    private final NewsletterService newsletterService;

    public NewsletterController(NewsletterService newsletterService) {
        this.newsletterService = newsletterService;
    }

    @GetMapping
    public List<Newsletter> getAll() {
        return newsletterService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Newsletter> getById(@PathVariable UUID id) {
        return newsletterService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/visible")
    public List<Newsletter> getVisible() {
        return newsletterService.findVisible();
    }

    @PostMapping
    public Newsletter create(@RequestBody Newsletter newsletter) {
        return newsletterService.save(newsletter);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Newsletter> update(@PathVariable UUID id, @RequestBody Newsletter newsletter) {
        try {
            return ResponseEntity.ok(newsletterService.update(id, newsletter));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        newsletterService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
