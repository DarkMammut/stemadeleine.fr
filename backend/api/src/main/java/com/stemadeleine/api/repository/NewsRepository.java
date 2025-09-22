package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.News;
import com.stemadeleine.api.model.PublishingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NewsRepository extends JpaRepository<News, UUID> {
    List<News> findByStatusNot(PublishingStatus status);

    Optional<News> findTopByModuleIdOrderByVersionDesc(UUID moduleId);
}
