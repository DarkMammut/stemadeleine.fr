package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.Contact;
import com.stemadeleine.api.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    // --- Paginated variants ---
    @Query("SELECT c FROM Contact c ORDER BY c.createdAt DESC")
    Page<Contact> findAllOrderByCreatedAtDesc(Pageable pageable);

    Page<Contact> findByEmailIgnoreCase(String email, Pageable pageable);

    Page<Contact> findByUserIsNull(Pageable pageable);

    @Query("SELECT c FROM Contact c WHERE c.createdAt >= :startDate AND c.createdAt <= :endDate ORDER BY c.createdAt DESC")
    Page<Contact> findByCreatedAtBetweenOrderByCreatedAtDesc(@Param("startDate") OffsetDateTime startDate, @Param("endDate") OffsetDateTime endDate, Pageable pageable);

    // simple pageable filter by isRead boolean
    Page<Contact> findByIsRead(Boolean isRead, Pageable pageable);

    @Query("SELECT c FROM Contact c WHERE (:isRead IS NULL OR c.isRead = :isRead)")
    Page<Contact> findByIsReadExplicit(@Param("isRead") Boolean isRead, Pageable pageable);

    // Search + optional isRead filter (both params optional)
    @Query("SELECT c FROM Contact c WHERE (:search IS NULL OR (LOWER(c.firstName) LIKE CONCAT('%',:search,'%') OR LOWER(c.lastName) LIKE CONCAT('%',:search,'%') OR LOWER(c.email) LIKE CONCAT('%',:search,'%') OR LOWER(c.subject) LIKE CONCAT('%',:search,'%') OR LOWER(c.message) LIKE CONCAT('%',:search,'%'))) AND (:isRead IS NULL OR c.isRead = :isRead)")
    Page<Contact> searchAndFilter(@Param("search") String search, @Param("isRead") Boolean isRead, Pageable pageable);
}
