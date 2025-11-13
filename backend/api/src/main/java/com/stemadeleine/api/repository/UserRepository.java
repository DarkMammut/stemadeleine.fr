package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByFirstnameIgnoreCaseAndLastnameIgnoreCase(String firstname, String lastname);

    Optional<User> findByFirstnameIgnoreCaseAndLastnameIgnoreCaseAndEmailIgnoreCase(String firstname, String lastname, String email);

    Optional<User> findByEmailIgnoreCase(String email);

    // Find users having at least one membership active with dateFin between provided dates
    @org.springframework.data.jpa.repository.Query("select distinct u from User u join u.memberships m where m.active = true and m.dateFin >= :start and m.dateFin <= :end")
    org.springframework.data.domain.Page<User> findAdherentsBetweenDates(java.time.LocalDate start, java.time.LocalDate end, org.springframework.data.domain.Pageable pageable);
}
