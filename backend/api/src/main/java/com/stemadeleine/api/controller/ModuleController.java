package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.*;
import com.stemadeleine.api.mapper.ContentMapper;
import com.stemadeleine.api.mapper.ModuleMapper;
import com.stemadeleine.api.model.Content;
import com.stemadeleine.api.model.CustomUserDetails;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.service.ModuleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/modules")
@RequiredArgsConstructor
public class ModuleController {

    private final ModuleService moduleService;
    private final ModuleMapper moduleMapper;
    private final ContentMapper contentMapper;

    @GetMapping("/section/{sectionId}")
    public ResponseEntity<List<ModuleDto>> getModulesBySection(@PathVariable UUID sectionId) {
        log.info("GET /api/modules/section/{} - Récupération des modules d'une section", sectionId);
        List<Module> modules = moduleService.getModulesBySection(sectionId);
        List<ModuleDto> moduleDtos = modules.stream()
                .map(moduleMapper::toDto)
                .toList();
        log.debug("Nombre de modules trouvés : {}", moduleDtos.size());
        return ResponseEntity.ok(moduleDtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ModuleDto> getModuleById(@PathVariable UUID id) {
        log.info("GET /api/modules/{} - Récupération d'un module par ID", id);
        return moduleService.getModuleById(id)
                .map(module -> {
                    log.debug("Module trouvé : {}", module.getId());
                    return ResponseEntity.ok(moduleMapper.toDto(module));
                })
                .orElseGet(() -> {
                    log.warn("Module non trouvé avec l'ID : {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @GetMapping("/by-module-id/{moduleId}")
    public ResponseEntity<ModuleDto> getModuleByModuleId(@PathVariable UUID moduleId) {
        log.info("GET /api/modules/by-module-id/{} - Récupération d'un module par moduleId", moduleId);
        return moduleService.getModuleByModuleId(moduleId)
                .map(module -> {
                    log.debug("Module trouvé : {}", module.getId());
                    return ResponseEntity.ok(moduleMapper.toDto(module));
                })
                .orElseGet(() -> {
                    log.warn("Module non trouvé avec le moduleId : {}", moduleId);
                    return ResponseEntity.notFound().build();
                });
    }

    @DeleteMapping("/{moduleId}")
    public ResponseEntity<Void> deleteModule(@PathVariable UUID moduleId) {
        log.info("DELETE /api/modules/{} - Suppression d'un module", moduleId);
        moduleService.softDeleteModule(moduleId);
        log.debug("Module supprimé : {}", moduleId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{moduleId}")
    public ResponseEntity<ModuleDto> updateModule(@PathVariable UUID moduleId, @RequestBody Module moduleDetails) {
        log.info("PUT /api/modules/{} - Mise à jour d'un module", moduleId);
        return moduleService.updateModule(moduleId, moduleDetails)
                .map(module -> {
                    log.debug("Module mis à jour : {}", module.getId());
                    return ResponseEntity.ok(moduleMapper.toDto(module));
                })
                .orElseGet(() -> {
                    log.warn("Module non trouvé avec l'ID : {}", moduleId);
                    return ResponseEntity.notFound().build();
                });
    }

    @PutMapping("/{id}/sort-order")
    public ResponseEntity<ModuleDto> updateSortOrder(@PathVariable UUID id, @RequestBody Integer sortOrder) {
        log.info("PUT /api/modules/{}/sort-order - Mise à jour de l'ordre de tri d'un module", id);
        return moduleService.updateSortOrder(id, sortOrder)
                .map(module -> {
                    log.debug("Ordre de tri mis à jour pour le module : {}", module.getId());
                    return ResponseEntity.ok(moduleMapper.toDto(module));
                })
                .orElseGet(() -> {
                    log.warn("Module non trouvé avec l'ID : {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @PutMapping("/{moduleId}/visibility")
    public ResponseEntity<ModuleDto> updateVisibility(@PathVariable UUID moduleId, @RequestBody Boolean isVisible) {
        log.info("PUT /api/modules/{}/visibility - Mise à jour de la visibilité d'un module", moduleId);
        return moduleService.updateVisibility(moduleId, isVisible)
                .map(module -> {
                    log.debug("Visibilité mise à jour pour le module : {}", module.getId());
                    return ResponseEntity.ok(moduleMapper.toDto(module));
                })
                .orElseGet(() -> {
                    log.warn("Module non trouvé avec l'ID : {}", moduleId);
                    return ResponseEntity.notFound().build();
                });
    }

    @GetMapping("/{moduleId}/contents")
    public ResponseEntity<List<ContentDto>> getModuleContents(@PathVariable UUID moduleId) {
        List<Content> contents = moduleService.getContentsByModuleId(moduleId);
        List<ContentDto> dtos = contents.stream().map(contentMapper::toDto).toList();
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/{moduleId}/contents")
    public ResponseEntity<ContentDto> createContentForModule(
            @PathVariable UUID moduleId,
            @RequestBody CreateContentRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails) {
        if (currentUserDetails == null) {
            throw new RuntimeException("User not authenticated");
        }
        User currentUser = currentUserDetails.account().getUser();
        Content content = moduleService.createContentForModule(moduleId, request, currentUser);
        return ResponseEntity.ok(contentMapper.toDto(content));
    }

    @GetMapping("/{moduleId}/medias")
    public ResponseEntity<List<MediaDto>> getModuleMedias(@PathVariable UUID moduleId) {
        List<com.stemadeleine.api.model.Media> medias = moduleService.getMediasByModuleId(moduleId);
        List<MediaDto> dtos = medias.stream().map(moduleMapper::toMediaDto).toList();
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/{moduleId}/medias")
    public ResponseEntity<MediaDto> attachMediaToModule(
            @PathVariable UUID moduleId,
            @RequestBody AttachMediaRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails) {
        if (currentUserDetails == null) {
            throw new RuntimeException("User not authenticated");
        }
        User currentUser = currentUserDetails.account().getUser();
        com.stemadeleine.api.model.Media media = moduleService.attachMediaToModule(moduleId, request.mediaId(), currentUser);
        return ResponseEntity.ok(moduleMapper.toMediaDto(media));
    }

    @DeleteMapping("/{moduleId}/medias/{mediaId}")
    public ResponseEntity<Void> detachMediaFromModule(
            @PathVariable UUID moduleId,
            @PathVariable UUID mediaId) {
        moduleService.detachMediaFromModule(moduleId, mediaId);
        return ResponseEntity.noContent().build();
    }
}
