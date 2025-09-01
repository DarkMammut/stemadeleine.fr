package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.Article;
import com.stemadeleine.api.model.PublishingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ArticleRepository extends JpaRepository<Article, UUID> {

    List<Article> findByIsVisibleTrue();

    List<Article> findByStatusNot(PublishingStatus status);
}