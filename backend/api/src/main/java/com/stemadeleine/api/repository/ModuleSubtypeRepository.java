package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.PublishingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Common queries of the module sub types (Article, News, Gallery...).
 * A logical module has at most one row per status (DRAFT / PUBLISHED).
 */
@NoRepositoryBean
public interface ModuleSubtypeRepository<T extends Module> extends JpaRepository<T, UUID> {

    List<T> findByStatus(PublishingStatus status);

    Optional<T> findByModuleIdAndStatus(UUID moduleId, PublishingStatus status);
}
