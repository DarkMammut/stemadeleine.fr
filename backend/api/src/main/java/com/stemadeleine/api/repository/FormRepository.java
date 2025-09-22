package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.Form;
import com.stemadeleine.api.model.PublishingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FormRepository extends JpaRepository<Form, UUID> {

    List<Form> findByStatusNot(PublishingStatus status);

    Optional<Form> findTopByModuleIdOrderByVersionDesc(UUID moduleId);
}

