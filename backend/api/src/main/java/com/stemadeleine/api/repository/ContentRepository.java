package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.Content;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ContentRepository extends JpaRepository<Content, UUID> {
    List<Content> findByOwnerIdOrderBySortOrderAsc(UUID ownerId);

    List<Content> findByIsVisibleTrue();
}