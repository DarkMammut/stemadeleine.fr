package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.CampaignDto;
import com.stemadeleine.api.model.Campaign;
import com.stemadeleine.api.service.CampaignService;
import com.stemadeleine.api.service.HelloAssoImportService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/campaigns")
public class CampaignController {
    private final CampaignService campaignService;
    private final HelloAssoImportService helloAssoImportService;

    public CampaignController(CampaignService campaignService, HelloAssoImportService helloAssoImportService) {
        this.campaignService = campaignService;
        this.helloAssoImportService = helloAssoImportService;
    }

    @GetMapping
    public List<CampaignDto> getAll() {
        return campaignService.findAllDto();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CampaignDto> getById(@PathVariable UUID id) {
        return campaignService.findById(id)
                .map(campaign -> ResponseEntity.ok(campaignService.toDto(campaign)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/state/{state}")
    public List<CampaignDto> getByState(@PathVariable String state) {
        return campaignService.findByStateDto(state);
    }

    @PostMapping
    public Campaign create(@RequestBody Campaign campaign) {
        return campaignService.save(campaign);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Campaign> update(@PathVariable UUID id, @RequestBody Campaign campaign) {
        try {
            return ResponseEntity.ok(campaignService.update(id, campaign));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        campaignService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/import")
    public ResponseEntity<String> importCampaigns(@RequestParam(value = "orgSlug", required = false) String orgSlug) {
        String slug = (orgSlug != null && !orgSlug.isBlank()) ? orgSlug : "les-amis-de-sainte-madeleine-de-la-jarrie";
        helloAssoImportService.importCampaigns(slug);
        return ResponseEntity.ok("Import des campagnes HelloAsso lancé pour orgSlug=" + slug);
    }
}
