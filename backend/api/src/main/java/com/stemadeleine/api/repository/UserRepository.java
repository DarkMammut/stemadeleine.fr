package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    // Méthodes de base fournies par JpaRepository sont suffisantes pour l'instant
}
