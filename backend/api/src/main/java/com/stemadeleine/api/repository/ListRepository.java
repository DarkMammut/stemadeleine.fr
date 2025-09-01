package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ListRepository extends JpaRepository<List, UUID> {
}

