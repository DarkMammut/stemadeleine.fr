package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ModuleRepository extends JpaRepository<Module, UUID> {

    List<Module> findByIsVisibleTrue();

    @Query("SELECT MAX(m.sortOrder) FROM Module m WHERE m.section.id = :sectionId")
    Short findMaxSortOrderBySection(@Param("sectionId") UUID sectionId);

    // Soft delete
    @Modifying
    @Query("UPDATE Module m SET m.status = 'DELETED', m.isVisible = false WHERE m.id = :id")
    void softDeleteById(@Param("id") UUID id);

    List<Module> findBySectionIdOrderBySortOrderAsc(UUID sectionId);
}
