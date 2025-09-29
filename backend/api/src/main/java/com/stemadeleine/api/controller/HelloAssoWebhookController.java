package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.HelloAssoWebhookPayload;
import com.stemadeleine.api.service.HelloAssoImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/helloasso/webhook")
@RequiredArgsConstructor
public class HelloAssoWebhookController {
    private final HelloAssoImportService importService;

    @PostMapping
    public ResponseEntity<Void> handleWebhook(@RequestBody HelloAssoWebhookPayload payload) {
        if (payload != null && payload.getEventType() != null) {
            switch (payload.getEventType()) {
                case "Payment":
                    importService.importPayments(payload.getOrgSlug());
                    break;
                case "Form":
                    importService.importCampaigns(payload.getOrgSlug());
                    break;
                case "Membership":
                    importService.importMembershipUsers(payload.getOrgSlug(), "formulaire-d-adhesion");
                    break;
            }
        }
        return ResponseEntity.ok().build();
    }
}

