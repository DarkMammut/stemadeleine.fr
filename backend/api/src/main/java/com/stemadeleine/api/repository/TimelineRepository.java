package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.PublishingStatus;
import com.stemadeleine.api.model.Timeline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TimelineRepository extends JpaRepository<Timeline, UUID> {

    List<Timeline> findByStatusNot(PublishingStatus status);

    Optional<Timeline> findTopByModuleIdOrderByVersionDesc(UUID moduleId);
}
