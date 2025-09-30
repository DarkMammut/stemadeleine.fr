package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.OrganizationDto;
import com.stemadeleine.api.dto.OrganizationInfoDTO;
import com.stemadeleine.api.dto.OrganizationSettingsDTO;
import com.stemadeleine.api.model.Organization;
import com.stemadeleine.api.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/organizations")
@RequiredArgsConstructor
public class OrganizationController {
    private final OrganizationService organizationService;

    @GetMapping
    public ResponseEntity<OrganizationDto> getLastCreatedOrganization() {
        OrganizationDto organization = organizationService.getLastCreatedOrganizationWithAddress();
        return ResponseEntity.ok(organization);
    }

    @PatchMapping("/{id}/info")
    public ResponseEntity<Organization> updateInfo(@PathVariable UUID id, @RequestBody OrganizationInfoDTO dto) {
        Organization updated = organizationService.updateInfo(id, dto);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/settings")
    public ResponseEntity<Organization> updateSettings(@PathVariable UUID id, @RequestBody OrganizationSettingsDTO dto) {
        Organization updated = organizationService.updateSettings(id, dto);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/logo")
    public ResponseEntity<Organization> updateLogo(@PathVariable UUID id, @RequestParam UUID mediaId) {
        Organization updatedLogo = organizationService.updateLogo(id, mediaId);
        return ResponseEntity.ok(updatedLogo);
    }

    @DeleteMapping("/{id}/media")
    public ResponseEntity<Organization> deleteLogo(@PathVariable UUID id) {
        Organization updated = organizationService.deleteLogo(id);
        return ResponseEntity.ok(updated);
    }
}
