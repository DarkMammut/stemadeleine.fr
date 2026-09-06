package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.ListContentMedia;
import com.stemadeleine.api.model.ListContentMedia.ListContentMediaId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ListContentMediaRepository extends JpaRepository<ListContentMedia, ListContentMediaId> {
}
