package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.Newsletter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface NewsletterRepository extends JpaRepository<Newsletter, UUID> {
    List<Newsletter> findByIsVisibleTrueOrderByStartDateDesc();
    List<Newsletter> findByStatusNot(com.stemadeleine.api.model.PublishingStatus status);
}
