package com.stemadeleine.api.service;

import com.stemadeleine.api.model.DonationCampaign;
import com.stemadeleine.api.repository.DonationCampaignRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DonationCampaignService {

    private final DonationCampaignRepository donationCampaignRepository;

    public DonationCampaignService(DonationCampaignRepository donationCampaignRepository) {
        this.donationCampaignRepository = donationCampaignRepository;
    }

    public List<DonationCampaign> findAll() {
        return donationCampaignRepository.findAll();
    }

    public Optional<DonationCampaign> findById(UUID id) {
        return donationCampaignRepository.findById(id);
    }

    public List<DonationCampaign> findActiveCampaigns() {
        return donationCampaignRepository.findByIsActiveTrue();
    }

    public DonationCampaign save(DonationCampaign donationCampaign) {
        return donationCampaignRepository.save(donationCampaign);
    }

    public DonationCampaign update(UUID id, DonationCampaign details) {
        return donationCampaignRepository.findById(id)
                .map(campaign -> {
                    campaign.setTitle(details.getTitle());
                    campaign.setDescription(details.getDescription());
                    campaign.setGoal(details.getGoal());
                    campaign.setUrl(details.getUrl());
                    campaign.setIsActive(details.getIsActive());
                    return donationCampaignRepository.save(campaign);
                })
                .orElseThrow(() -> new RuntimeException("DonationCampaign not found with id " + id));
    }

    public void delete(UUID id) {
        donationCampaignRepository.deleteById(id);
    }
}
