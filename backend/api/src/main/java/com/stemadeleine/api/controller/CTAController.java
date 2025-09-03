package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.CTADto;
import com.stemadeleine.api.dto.CreateCTARequest;
import com.stemadeleine.api.mapper.ModuleMapper;
import com.stemadeleine.api.model.CTA;
import com.stemadeleine.api.model.CustomUserDetails;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.service.CTAService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/ctas")
@RequiredArgsConstructor
public class CTAController {
    private final CTAService ctaService;
    private final ModuleMapper moduleMapper;

    @GetMapping
    public List<CTADto> getAllCTAs() {
        return ctaService.getAllCTAs().stream().map(moduleMapper::toDto).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CTADto> getCTAById(@PathVariable UUID id) {
        return ctaService.getCTAById(id)
                .map(moduleMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<CTADto> createCTA(@RequestBody CreateCTARequest request, @AuthenticationPrincipal CustomUserDetails currentUserDetails) {
        if (currentUserDetails == null) {
            throw new RuntimeException("User not authenticated");
        }
        User currentUser = currentUserDetails.account().getUser();
        CTA cta = ctaService.createCTAWithModule(request, currentUser);
        return ResponseEntity.ok(moduleMapper.toDto(cta));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CTADto> updateCTA(@PathVariable UUID id, @RequestBody CTA details) {
        try {
            return ResponseEntity.ok(moduleMapper.toDto(ctaService.updateCTA(id, details)));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCTA(@PathVariable UUID id) {
        ctaService.softDeleteCTA(id);
        return ResponseEntity.noContent().build();
    }
}
