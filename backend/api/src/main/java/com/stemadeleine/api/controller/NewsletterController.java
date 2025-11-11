package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.CreateModuleRequest;
import com.stemadeleine.api.dto.NewsletterDto;
import com.stemadeleine.api.dto.UpdateNewsletterPutRequest;
import com.stemadeleine.api.dto.UpdateNewsletterRequest;
import com.stemadeleine.api.mapper.NewsletterMapper;
import com.stemadeleine.api.model.CustomUserDetails;
import com.stemadeleine.api.model.NewsVariants;
import com.stemadeleine.api.model.Newsletter;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.service.NewsletterService;
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
@RequestMapping("/api/newsletters")
@RequiredArgsConstructor
public class NewsletterController {
    private final NewsletterService newsletterService;
    private final NewsletterMapper newsletterMapper;

    @GetMapping
    public List<NewsletterDto> getAllNewsletters() {
        log.info("GET /api/newsletter - Retrieving all newsletters");
        List<Newsletter> newsletters = newsletterService.getAllNewsletters();
        log.debug("Number of newsletters found: {}", newsletters.size());
        return newsletters.stream().map(newsletterMapper::toDto).toList();
    }

    @GetMapping("/variants")
    public ResponseEntity<List<String>> getNewsletterVariants() {
        log.info("GET /api/newsletters/variants - Retrieving available newsletter variants");
        List<String> variants = Arrays.stream(NewsVariants.values())
                .map(Enum::name)
                .collect(Collectors.toList());
        log.debug("Newsletter variants: {}", variants);
        return ResponseEntity.ok(variants);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NewsletterDto> getNewsletterById(@PathVariable UUID id) {
        log.info("GET /api/newsletter/{} - Retrieving newsletter by ID", id);
        return newsletterService.getNewsletterById(id)
                .map(newsletter -> {
                    log.debug("Newsletter found: {}", newsletter.getId());
                    return ResponseEntity.ok(newsletterMapper.toDto(newsletter));
                })
                .orElseGet(() -> {
                    log.warn("Newsletter not found with ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @GetMapping("/by-module-id/{moduleId}")
    public ResponseEntity<NewsletterDto> getNewsletterByModuleId(@PathVariable UUID moduleId) {
        log.info("GET /api/newsletters/by-module-id/{} - Retrieving latest newsletter version by moduleId", moduleId);
        return newsletterService.getLastVersionByModuleId(moduleId)
                .map(newsletter -> {
                    log.debug("Newsletter found: {} (version {})", newsletter.getId(), newsletter.getVersion());
                    return ResponseEntity.ok(newsletterMapper.toDto(newsletter));
                })
                .orElseGet(() -> {
                    log.warn("Newsletter not found with moduleId: {}", moduleId);
                    return ResponseEntity.notFound().build();
                });
    }

    @PostMapping
    public ResponseEntity<NewsletterDto> createNewsletter(
            @RequestBody CreateModuleRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            log.error("Attempt to create newsletter without authentication");
            throw new RuntimeException("User not authenticated");
        }

        log.info("POST /api/newsletter - Creating a new newsletter");
        Newsletter newsletter = newsletterService.createNewsletterWithModule(
                request,
                currentUserDetails.account().getUser()
        );
        log.debug("Newsletter created with ID: {}", newsletter.getId());
        return ResponseEntity.ok(newsletterMapper.toDto(newsletter));
    }

    @PostMapping("/version")
    public ResponseEntity<NewsletterDto> createNewVersionForModule(
            @RequestBody UpdateNewsletterRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails) {
        if (currentUserDetails == null) {
            throw new RuntimeException("User not authenticated");
        }
        User currentUser = currentUserDetails.account().getUser();
        log.info("POST /api/newsletters/version - Creating a new version for module: {}", request.moduleId());
        Newsletter newsletter = newsletterService.createNewsletterVersion(request, currentUser);
        log.debug("New version created with ID: {}", newsletter.getId());
        return ResponseEntity.ok(newsletterMapper.toDto(newsletter));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NewsletterDto> updateNewsletter(@PathVariable UUID id, @RequestBody UpdateNewsletterPutRequest request) {
        log.info("PUT /api/newsletter/{} - Updating a newsletter", id);
        try {
            Newsletter updatedNewsletter = newsletterService.updateNewsletter(id, request);
            log.debug("Newsletter updated: {}", updatedNewsletter.getId());
            return ResponseEntity.ok(newsletterMapper.toDto(updatedNewsletter));
        } catch (RuntimeException e) {
            log.error("Error updating newsletter {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNewsletter(@PathVariable UUID id) {
        log.info("DELETE /api/newsletter/{} - Deleting a newsletter", id);
        newsletterService.softDeleteNewsletter(id);
        log.debug("Newsletter deleted: {}", id);
        return ResponseEntity.noContent().build();
    }
}
