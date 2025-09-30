package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, UUID> {
    Optional<Organization> findById(UUID id);

    Optional<Organization> findTopByOrderByCreatedAtDesc();
}
