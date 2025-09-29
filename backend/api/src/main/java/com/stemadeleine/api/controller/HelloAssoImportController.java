package com.stemadeleine.api.controller;

import com.stemadeleine.api.service.HelloAssoImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/helloasso")
@RequiredArgsConstructor
public class HelloAssoImportController {
    private final HelloAssoImportService importService;

    @PostMapping("/import")
    public ResponseEntity<String> manualImport(@RequestParam(value = "orgSlug", required = false) String orgSlug) {
        String slug = (orgSlug != null && !orgSlug.isBlank()) ? orgSlug : "les-amis-de-sainte-madeleine-de-la-jarrie";
        importService.importCampaigns(slug);
        importService.importMembershipUsers(
                slug,
                "formulaire-d-adhesion"
        );
        importService.importPayments(slug);
        return ResponseEntity.ok("Import HelloAsso lancé avec succès.");
    }
}

