package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.CreateNewsletterRequest;
import com.stemadeleine.api.dto.NewsletterDto;
import com.stemadeleine.api.mapper.NewsletterMapper;
import com.stemadeleine.api.model.CustomUserDetails;
import com.stemadeleine.api.model.Newsletter;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.service.NewsletterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/newsletters")
@RequiredArgsConstructor
public class NewsletterController {

    private final NewsletterService newsletterService;
    private final NewsletterMapper newsletterMapper;

    @GetMapping
    public List<NewsletterDto> getAllNewsletters() {
        return newsletterService.getAllNewsletters().stream().map(newsletterMapper::toDto).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<NewsletterDto> getNewsletterById(@PathVariable UUID id) {
        return newsletterService.getNewsletterById(id)
                .map(newsletterMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<NewsletterDto> createNewsletterWithModule(@RequestBody CreateNewsletterRequest request, @AuthenticationPrincipal CustomUserDetails currentUserDetails) {
        if (currentUserDetails == null) {
            throw new RuntimeException("User not authenticated");
        }
        User currentUser = currentUserDetails.account().getUser();
        Newsletter newsletter = newsletterService.createNewsletterWithModule(request, currentUser);
        return ResponseEntity.ok(newsletterMapper.toDto(newsletter));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NewsletterDto> updateNewsletter(@PathVariable UUID id, @RequestBody Newsletter details) {
        try {
            Newsletter updated = newsletterService.updateNewsletter(id, details);
            return ResponseEntity.ok(newsletterMapper.toDto(updated));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNewsletter(@PathVariable UUID id) {
        newsletterService.softDeleteNewsletter(id);
        return ResponseEntity.noContent().build();
    }
}
