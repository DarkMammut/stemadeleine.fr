package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CampaignRepository extends JpaRepository<Campaign, UUID> {
    Optional<Campaign> findByFormSlug(String formSlug);

    List<Campaign> findByState(String state);
}
