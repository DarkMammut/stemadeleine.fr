package com.stemadeleine.api.controller;

import com.stemadeleine.api.service.HelloAssoImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/helloasso")
@RequiredArgsConstructor
public class HelloAssoImportController {
    private final HelloAssoImportService importService;

    @PostMapping("/import")
    public ResponseEntity<String> manualImport() {
        importService.importMembershipUsers(
                "les-amis-de-sainte-madeleine-de-la-jarrie",
                "formulaire-d-adhesion"
        );
        return ResponseEntity.ok("Import HelloAsso lancé avec succès.");
    }
}

