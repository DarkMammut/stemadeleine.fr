package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.CTA;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CTARepository extends JpaRepository<CTA, UUID> {

    List<CTA> findByStatusNot(String status);

    Optional<CTA> findTopByModuleIdOrderByVersionDesc(UUID moduleId);
}
