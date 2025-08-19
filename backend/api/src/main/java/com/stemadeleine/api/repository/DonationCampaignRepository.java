package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.DonationCampaign;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DonationCampaignRepository extends JpaRepository<DonationCampaign, UUID> {
    List<DonationCampaign> findByIsActiveTrue();
}
