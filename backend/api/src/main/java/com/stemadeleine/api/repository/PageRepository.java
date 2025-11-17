package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.Page;
import com.stemadeleine.api.model.PublishingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PageRepository extends JpaRepository<Page, UUID> {

    Optional<Page> findBySlug(String slug);

    // Dernière version publiée
    Optional<Page> findTopByPageIdAndStatusOrderByVersionDesc(UUID pageId, PublishingStatus status);

    // Dernière version (draft ou publiée)
    Optional<Page> findTopByPageIdOrderByVersionDesc(UUID pageId);

    // Récupérer le numéro de version max pour un pageId
    @Query("SELECT MAX(p.version) FROM Page p WHERE p.pageId = :pageId")
    Optional<Integer> findMaxVersionByPageId(UUID pageId);

    @Query("SELECT MAX(p.sortOrder) FROM Page p WHERE (:parentId IS NULL AND p.parentPage IS NULL) OR (p.parentPage.id = :parentId)")
    Integer findMaxSortOrderByParent(@Param("parentId") UUID parentId);

    // Nouvelle méthode pour trouver le sortOrder max par parentPageId
    @Query("SELECT MAX(p.sortOrder) FROM Page p WHERE (:parentPageId IS NULL AND p.parentPage IS NULL) OR (p.parentPage.pageId = :parentPageId)")
    Integer findMaxSortOrderByParentPage(@Param("parentPageId") UUID parentPageId);

    // Vérifier si un slug existe déjà
    boolean existsBySlug(String slug);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Page p SET p.status = 'DELETED', p.isVisible = false WHERE p.id = :id")
    void softDeleteById(@Param("id") UUID id);

    List<Page> findByParentPage(Page parentPage);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM Page p WHERE LOWER(p.title) LIKE CONCAT('%',:q,'%') OR LOWER(p.name) LIKE CONCAT('%',:q,'%') OR LOWER(p.slug) LIKE CONCAT('%',:q,'%')")
    java.util.List<com.stemadeleine.api.model.Page> search(@org.springframework.data.repository.query.Param("q") String q, org.springframework.data.domain.Pageable pageable);
}
