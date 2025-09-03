package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.CTA;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CTARepository extends JpaRepository<CTA, UUID> {
    List<CTA> findByStatusNot(String status);
}

