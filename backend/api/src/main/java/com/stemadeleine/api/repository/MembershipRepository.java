package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.Membership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, UUID> {
    // Méthodes personnalisées si besoin
    List<Membership> findByUser_Id(UUID userId);
}
