package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.Media;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MediaRepository extends JpaRepository<Media, UUID> {
    List<Media> findByIsVisibleTrue();
}
