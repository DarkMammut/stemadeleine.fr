package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.CreateSectionRequest;
import com.stemadeleine.api.dto.SectionDto;
import com.stemadeleine.api.mapper.SectionMapper;
import com.stemadeleine.api.model.CustomUserDetails;
import com.stemadeleine.api.model.Section;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.service.SectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sections")
@RequiredArgsConstructor
public class SectionController {

    private final SectionService sectionService;
    private final SectionMapper sectionMapper;

    @GetMapping
    public List<Section> getAllSections() {
        return sectionService.getAllSections();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Section> getSectionById(@PathVariable UUID id) {
        return sectionService.getSectionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/page/{pageId}")
    public List<Section> getSectionsByPage(@PathVariable UUID pageId) {
        return sectionService.getSectionsByPage(pageId);
    }

    @PostMapping
    public ResponseEntity<SectionDto> createNewSection(
            @RequestBody CreateSectionRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = currentUserDetails.account().getUser();

        Section newSection = sectionService.createNewSection(
                request.pageId(),
                request.name(),
                currentUser
        );

        return ResponseEntity.ok(sectionMapper.toDto(newSection));
    }

    @PostMapping("/draft")
    public ResponseEntity<SectionDto> createDraft(
            @RequestBody CreateSectionRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            throw new RuntimeException("User not authenticated");
        }

        User author = currentUserDetails.account().getUser();

        Section section = sectionService.createNewSection(request.pageId(), request.name(), author);
        SectionDto dto = sectionMapper.toDto(section);

        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Section> updateSection(@PathVariable UUID id, @RequestBody Section sectionDetails) {
        try {
            return ResponseEntity.ok(sectionService.updateSection(id, sectionDetails));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSection(@PathVariable UUID id) {
        sectionService.deleteSection(id);
        return ResponseEntity.noContent().build();
    }
}