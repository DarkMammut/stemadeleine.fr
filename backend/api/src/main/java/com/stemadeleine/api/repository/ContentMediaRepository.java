package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.ContentMedia;
import com.stemadeleine.api.model.ContentMedia.ContentMediaId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContentMediaRepository extends JpaRepository<ContentMedia, ContentMediaId> {
}