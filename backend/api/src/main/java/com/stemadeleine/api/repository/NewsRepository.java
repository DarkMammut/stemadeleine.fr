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

    @org.springframework.data.jpa.repository.Query("SELECT n FROM News n WHERE LOWER(n.title) LIKE CONCAT('%',:q,'%') OR LOWER(n.name) LIKE CONCAT('%',:q,'%')")
    java.util.List<com.stemadeleine.api.model.News> search(@org.springframework.data.repository.query.Param("q") String q, org.springframework.data.domain.Pageable pageable);
}
