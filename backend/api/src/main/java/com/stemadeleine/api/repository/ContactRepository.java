package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.Contact;
import com.stemadeleine.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ContactRepository extends JpaRepository<Contact, UUID> {

    List<Contact> findByEmailIgnoreCase(String email);

    List<Contact> findByUser(User user);

    List<Contact> findByUserIsNull();

    @Query("SELECT c FROM Contact c WHERE c.createdAt >= :startDate AND c.createdAt <= :endDate ORDER BY c.createdAt DESC")
    List<Contact> findByCreatedAtBetweenOrderByCreatedAtDesc(@Param("startDate") OffsetDateTime startDate, @Param("endDate") OffsetDateTime endDate);

    @Query("SELECT c FROM Contact c ORDER BY c.createdAt DESC")
    List<Contact> findAllOrderByCreatedAtDesc();
}
