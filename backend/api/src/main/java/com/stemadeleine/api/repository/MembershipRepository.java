package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.Membership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, UUID> {
    // Méthodes personnalisées si besoin
    List<Membership> findByUser_Id(UUID userId);

    @Query("select count(m) from Membership m where (m.active = true) and ( (m.dateFin is not null and function('year', m.dateFin) = :year) or (m.dateAdhesion is not null and function('year', m.dateAdhesion) = :year) )")
    Long countActiveForYear(@org.springframework.data.repository.query.Param("year") Integer year);
}
