package com.stemadeleine.api.service;

import com.stemadeleine.api.model.Media;
import com.stemadeleine.api.repository.MediaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class MediaService {

    private final MediaRepository mediaRepository;

    public MediaService(MediaRepository mediaRepository) {
        this.mediaRepository = mediaRepository;
    }

    public List<Media> findAll() {
        return mediaRepository.findAll();
    }

    public Optional<Media> findById(UUID id) {
        return mediaRepository.findById(id);
    }

    public List<Media> findVisible() {
        return mediaRepository.findByIsVisibleTrue();
    }

    public Media save(Media media) {
        return mediaRepository.save(media);
    }

    public Media update(UUID id, Media details) {
        return mediaRepository.findById(id)
                .map(media -> {
                    media.setFileUrl(details.getFileUrl());
                    media.setTitle(details.getTitle());
                    media.setAltText(details.getAltText());
                    media.setFileType(details.getFileType());
                    media.setFileSize(details.getFileSize());
                    media.setIsVisible(details.getIsVisible());
                    return mediaRepository.save(media);
                })
                .orElseThrow(() -> new RuntimeException("Media not found with id " + id));
    }

    public void delete(UUID id) {
        mediaRepository.deleteById(id);
    }
}
