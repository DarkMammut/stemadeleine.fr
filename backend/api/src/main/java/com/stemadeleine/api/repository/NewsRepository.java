package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.News;
import com.stemadeleine.api.model.NewsVariants;
import com.stemadeleine.api.model.PublishingStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NewsRepository extends ModuleSubtypeRepository<News> {

    boolean existsByVariantAndStatus(NewsVariants variant, PublishingStatus status);

    @Query("""
            SELECT n
            FROM News n
            WHERE n.status = :status
              AND (LOWER(n.title) LIKE CONCAT('%', :q, '%')
                OR LOWER(n.name) LIKE CONCAT('%', :q, '%'))
            """)
    List<News> search(@Param("q") String q, @Param("status") PublishingStatus status, Pageable pageable);
}
