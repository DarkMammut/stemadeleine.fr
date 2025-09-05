package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.List;
import com.stemadeleine.api.model.PublishingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ListRepository extends JpaRepository<List, UUID> {
    java.util.List<List> findByIsVisibleTrueOrderByCreatedAtDesc();

    java.util.List<List> findByStatusNot(PublishingStatus status);
}
