package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.CreateModuleRequest;
import com.stemadeleine.api.dto.ModuleDto;
import com.stemadeleine.api.mapper.ModuleMapper;
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

    @PostMapping
    public ResponseEntity<ModuleDto> createNewModule(@RequestBody CreateModuleRequest request, @AuthenticationPrincipal CustomUserDetails currentUserDetails) {

        if (currentUserDetails == null) {
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = currentUserDetails.account().getUser();

        Module newModule = moduleService.createNewModule(
                request.sectionId(),
                request.name(),
                request.type(),
                currentUser
        );
        return ResponseEntity.ok(moduleMapper.toDto(newModule));
    }

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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteModule(@PathVariable UUID id) {
        log.info("DELETE /api/modules/{} - Suppression d'un module", id);
        moduleService.softDeleteModule(id);
        log.debug("Module supprimé : {}", id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<ModuleDto> updateModule(@PathVariable UUID id, @RequestBody Module moduleDetails) {
        log.info("PUT /api/modules/{} - Mise à jour d'un module", id);
        return moduleService.updateModule(id, moduleDetails)
                .map(module -> {
                    log.debug("Module mis à jour : {}", module.getId());
                    return ResponseEntity.ok(moduleMapper.toDto(module));
                })
                .orElseGet(() -> {
                    log.warn("Module non trouvé avec l'ID : {}", id);
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

    @PutMapping("/{id}/visibility")
    public ResponseEntity<ModuleDto> updateVisibility(@PathVariable UUID id, @RequestBody Boolean isVisible) {
        log.info("PUT /api/modules/{}/visibility - Mise à jour de la visibilité d'un module", id);
        return moduleService.updateVisibility(id, isVisible)
                .map(module -> {
                    log.debug("Visibilité mise à jour pour le module : {}", module.getId());
                    return ResponseEntity.ok(moduleMapper.toDto(module));
                })
                .orElseGet(() -> {
                    log.warn("Module non trouvé avec l'ID : {}", id);
                    return ResponseEntity.notFound().build();
                });
    }
}
