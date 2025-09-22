package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.Newsletter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NewsletterRepository extends JpaRepository<Newsletter, UUID> {
    List<Newsletter> findByStatusNot(com.stemadeleine.api.model.PublishingStatus status);

    Optional<Newsletter> findTopByModuleIdOrderByVersionDesc(UUID moduleId);
}
