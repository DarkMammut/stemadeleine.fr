package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface PageRepository extends JpaRepository<Page, UUID> {

    Optional<Page> findBySlug(String slug);

    // Dernière version publiée
    Optional<Page> findTopByPageIdAndIsVisibleTrueOrderByVersionDesc(UUID pageId);

    // Dernière version (draft ou publiée)
    Optional<Page> findTopByPageIdOrderByVersionDesc(UUID pageId);

    // Récupérer le numéro de version max pour un pageId
    @Query("SELECT MAX(p.version) FROM Page p WHERE p.pageId = :pageId")
    Optional<Integer> findMaxVersionByPageId(UUID pageId);

    @Query("SELECT MAX(p.sortOrder) FROM Page p WHERE (:parentId IS NULL AND p.parentPage IS NULL) OR (p.parentPage.id = :parentId)")
    Integer findMaxSortOrderByParent(@Param("parentId") UUID parentId);
}
