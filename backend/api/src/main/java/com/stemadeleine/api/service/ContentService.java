package com.stemadeleine.api.service;

import com.stemadeleine.api.model.Content;
import com.stemadeleine.api.repository.ContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ContentService {

    private final ContentRepository contentRepository;

    public List<Content> getAllContents() {
        return contentRepository.findAll();
    }

    public Optional<Content> getContentById(UUID id) {
        return contentRepository.findById(id);
    }

    public List<Content> getContentsByOwner(UUID ownerId) {
        return contentRepository.findByOwnerIdOrderBySortOrderAsc(ownerId);
    }

    public Content createContent(Content content) {
        content.setCreatedAt(Instant.now());
        content.setUpdatedAt(Instant.now());
        return contentRepository.save(content);
    }

    public Content updateContent(UUID id, Content contentDetails) {
        return contentRepository.findById(id)
                .map(content -> {
                    content.setTitle(contentDetails.getTitle());
                    content.setBody(contentDetails.getBody());
                    content.setSortOrder(contentDetails.getSortOrder());
                    content.setIsVisible(contentDetails.getIsVisible());
                    content.setOwnerId(contentDetails.getOwnerId());
                    content.setUpdatedAt(Instant.now());
                    return contentRepository.save(content);
                })
                .orElseThrow(() -> new RuntimeException("Content not found"));
    }

    public void deleteContent(UUID id) {
        contentRepository.deleteById(id);
    }
}
