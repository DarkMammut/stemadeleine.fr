package com.stemadeleine.api.controller;

import com.stemadeleine.api.model.DonationCampaign;
import com.stemadeleine.api.service.DonationCampaignService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/donation-campaigns")
public class DonationCampaignController {

    private final DonationCampaignService donationCampaignService;

    public DonationCampaignController(DonationCampaignService donationCampaignService) {
        this.donationCampaignService = donationCampaignService;
    }

    @GetMapping
    public List<DonationCampaign> getAll() {
        return donationCampaignService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DonationCampaign> getById(@PathVariable UUID id) {
        return donationCampaignService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/active")
    public List<DonationCampaign> getActiveCampaigns() {
        return donationCampaignService.findActiveCampaigns();
    }

    @PostMapping
    public DonationCampaign create(@RequestBody DonationCampaign donationCampaign) {
        return donationCampaignService.save(donationCampaign);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DonationCampaign> update(@PathVariable UUID id, @RequestBody DonationCampaign donationCampaign) {
        try {
            return ResponseEntity.ok(donationCampaignService.update(id, donationCampaign));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        donationCampaignService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
