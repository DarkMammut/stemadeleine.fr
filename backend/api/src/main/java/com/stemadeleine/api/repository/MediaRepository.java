package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.Media;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MediaRepository extends JpaRepository<Media, UUID> {
    List<Media> findByIsVisibleTrue();

    List<Media> findByTitleContainingIgnoreCaseOrAltTextContainingIgnoreCase(String titleQuery, String altTextQuery);
}
