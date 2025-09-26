package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CampaignDto;
import com.stemadeleine.api.model.Campaign;
import com.stemadeleine.api.repository.CampaignRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CampaignService {
    private final CampaignRepository campaignRepository;

    public CampaignService(CampaignRepository campaignRepository) {
        this.campaignRepository = campaignRepository;
    }

    public List<Campaign> findAll() {
        return campaignRepository.findAll();
    }

    public Optional<Campaign> findById(UUID id) {
        return campaignRepository.findById(id);
    }

    public List<Campaign> findByState(String state) {
        return campaignRepository.findByState(state);
    }

    public Campaign save(Campaign campaign) {
        return campaignRepository.save(campaign);
    }

    public Campaign update(UUID id, Campaign details) {
        return campaignRepository.findById(id)
                .map(campaign -> {
                    campaign.setTitle(details.getTitle());
                    campaign.setDescription(details.getDescription());
                    campaign.setUrl(details.getUrl());
                    campaign.setState(details.getState());
                    campaign.setFormType(details.getFormType());
                    campaign.setCurrency(details.getCurrency());
                    return campaignRepository.save(campaign);
                })
                .orElseThrow(() -> new RuntimeException("Campaign not found with id " + id));
    }

    public void delete(UUID id) {
        campaignRepository.deleteById(id);
    }

    public CampaignDto toDto(Campaign campaign) {
        return CampaignDto.builder()
                .id(campaign.getId())
                .title(campaign.getTitle())
                .formType(campaign.getFormType())
                .state(campaign.getState())
                .currency(campaign.getCurrency())
                .url(campaign.getUrl())
                .formSlug(campaign.getFormSlug())
                .build();
    }

    public List<CampaignDto> findAllDto() {
        return campaignRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public List<CampaignDto> findByStateDto(String state) {
        return campaignRepository.findByState(state).stream()
                .map(this::toDto)
                .toList();
    }
}
