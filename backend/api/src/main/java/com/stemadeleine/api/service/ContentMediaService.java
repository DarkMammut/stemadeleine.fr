package com.stemadeleine.api.service;

import com.stemadeleine.api.model.ContentMedia;
import com.stemadeleine.api.model.ContentMedia.ContentMediaId;
import com.stemadeleine.api.repository.ContentMediaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ContentMediaService {

    private final ContentMediaRepository contentMediaRepository;

    public ContentMediaService(ContentMediaRepository contentMediaRepository) {
        this.contentMediaRepository = contentMediaRepository;
    }

    public List<ContentMedia> findAll() {
        return contentMediaRepository.findAll();
    }

    public Optional<ContentMedia> findById(ContentMediaId id) {
        return contentMediaRepository.findById(id);
    }

    public ContentMedia save(ContentMedia contentMedia) {
        return contentMediaRepository.save(contentMedia);
    }

    public ContentMedia update(ContentMediaId id, ContentMedia details) {
        return contentMediaRepository.findById(id)
                .map(cm -> {
                    cm.setSortOrder(details.getSortOrder());
                    cm.setContent(details.getContent());
                    cm.setMedia(details.getMedia());
                    return contentMediaRepository.save(cm);
                })
                .orElseThrow(() -> new RuntimeException("ContentMedia not found with id " + id));
    }

    public void delete(ContentMediaId id) {
        contentMediaRepository.deleteById(id);
    }
}
