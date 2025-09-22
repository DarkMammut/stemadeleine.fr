package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.CTADto;
import com.stemadeleine.api.dto.CreateModuleRequest;
import com.stemadeleine.api.dto.UpdateCTARequest;
import com.stemadeleine.api.mapper.CTAMapper;
import com.stemadeleine.api.model.CTA;
import com.stemadeleine.api.model.CustomUserDetails;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.service.CTAService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/cta")
@RequiredArgsConstructor
public class CTAController {
    private final CTAService ctaService;
    private final CTAMapper ctaMapper;

    @GetMapping
    public List<CTADto> getAllCTAs() {
        log.info("GET /api/cta - Retrieving all CTAs");
        List<CTA> ctas = ctaService.getAllCTAs();
        log.debug("Number of CTAs found: {}", ctas.size());
        return ctas.stream()
                .map(ctaMapper::toDto)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CTADto> getCTAById(@PathVariable UUID id) {
        log.info("GET /api/cta/{} - Retrieving CTA by ID", id);
        return ctaService.getCTAById(id)
                .map(cta -> {
                    log.debug("CTA found: {}", cta.getId());
                    return ResponseEntity.ok(ctaMapper.toDto(cta));
                })
                .orElseGet(() -> {
                    log.warn("CTA not found with ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @PostMapping
    public ResponseEntity<CTADto> createCTA(
            @Valid @RequestBody CreateModuleRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            log.error("Attempt to create CTA without authentication");
            throw new RuntimeException("User not authenticated");
        }

        log.info("POST /api/cta - Creating a new CTA");
        CTA cta = ctaService.createCTAWithModule(
                request,
                currentUserDetails.account().getUser()
        );
        log.debug("CTA created with ID: {}", cta.getId());
        return ResponseEntity.ok(ctaMapper.toDto(cta));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CTADto> updateCTA(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateCTARequest request,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        log.info("PUT /api/cta/{} - Updating a CTA", id);
        try {
            CTA updatedCTA = ctaService.updateCTA(id, request, customUserDetails.account().getUser());
            log.debug("CTA updated: {}", updatedCTA.getId());
            return ResponseEntity.ok(ctaMapper.toDto(updatedCTA));
        } catch (RuntimeException e) {
            log.error("Error updating CTA {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCTA(@PathVariable UUID id) {
        log.info("DELETE /api/cta/{} - Deleting a CTA", id);
        ctaService.softDeleteCTA(id);
        log.debug("CTA deleted: {}", id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/version")
    public ResponseEntity<CTADto> createNewVersionForModule(
            @RequestBody UpdateCTARequest request,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails) {
        if (currentUserDetails == null) {
            throw new RuntimeException("User not authenticated");
        }
        User currentUser = currentUserDetails.account().getUser();
        log.info("POST /api/cta/version - Creating a new version for the module: {}", request.moduleId());
        CTA cta = ctaService.createCTAVersion(request, currentUser);
        log.debug("New version created with ID: {}", cta.getId());
        return ResponseEntity.ok(ctaMapper.toDto(cta));
    }
}
