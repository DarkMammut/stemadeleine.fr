package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.Gallery;
import com.stemadeleine.api.model.PublishingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GalleryRepository extends JpaRepository<Gallery, UUID> {
    List<Gallery> findByStatusNot(PublishingStatus status);
}

