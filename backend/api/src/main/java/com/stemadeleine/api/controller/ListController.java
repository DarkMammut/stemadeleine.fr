package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.CreateModuleRequest;
import com.stemadeleine.api.dto.ListDto;
import com.stemadeleine.api.dto.UpdateListRequest;
import com.stemadeleine.api.mapper.ListMapper;
import com.stemadeleine.api.model.CustomUserDetails;
import com.stemadeleine.api.model.List;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.service.ListService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/lists")
@RequiredArgsConstructor
public class ListController {
    private final ListService listService;
    private final ListMapper listMapper;

    @GetMapping
    public java.util.List<ListDto> getAllLists() {
        log.info("GET /api/lists - Retrieving all lists");
        java.util.List<List> lists = listService.getAllLists();
        log.debug("Number of lists found: {}", lists.size());
        return lists.stream()
                .map(listMapper::toDto)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListDto> getListById(@PathVariable UUID id) {
        log.info("GET /api/lists/{} - Retrieving list by ID", id);
        return listService.getListById(id)
                .map(list -> {
                    log.debug("List found: {}", list.getId());
                    return ResponseEntity.ok(listMapper.toDto(list));
                })
                .orElseGet(() -> {
                    log.warn("List not found with ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @PostMapping
    public ResponseEntity<ListDto> createListWithModule(@RequestBody CreateModuleRequest request, @AuthenticationPrincipal CustomUserDetails currentUserDetails) {
        if (currentUserDetails == null) {
            throw new RuntimeException("User not authenticated");
        }
        User currentUser = currentUserDetails.account().getUser();
        log.info("POST /api/lists - Création d'une nouvelle liste pour la section : {}", request.sectionId());
        List list = listService.createListWithModule(request, currentUser);
        log.debug("Liste créé avec l'ID : {}", list.getId());
        return ResponseEntity.ok(listMapper.toDto(list));
    }

    @PostMapping("/version")
    public ResponseEntity<ListDto> createNewVersionForModule(
            @RequestBody UpdateListRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails) {
        if (currentUserDetails == null) {
            throw new RuntimeException("User not authenticated");
        }
        User currentUser = currentUserDetails.account().getUser();
        log.info("POST /api/lists/version - Création d'une nouvelle version pour le module : {}", request.moduleId());
        List list = listService.createListVersion(request, currentUser);
        log.debug("Nouvelle version créée avec l'ID : {}", list.getId());
        return ResponseEntity.ok(listMapper.toDto(list));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ListDto> updateList(@PathVariable UUID id, @RequestBody List listDetails) {
        log.info("PUT /api/lists/{} - Mise à jour d'une liste", id);
        try {
            List updated = listService.updateList(id, listDetails);
            log.debug("Liste mis à jour : {}", updated.getId());
            return ResponseEntity.ok(listMapper.toDto(updated));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> softDeleteList(@PathVariable UUID id) {
        boolean deleted = listService.softDeleteList(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
