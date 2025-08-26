package com.stemadeleine.api.service;

import com.stemadeleine.api.model.Media;
import com.stemadeleine.api.repository.MediaRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class MediaService {

    private final SupabaseStorageClient storageClient;
    private final MediaRepository mediaRepository;

    private final String bucket = "media";

    public MediaService(MediaRepository mediaRepository, SupabaseStorageClient storageClient) {
        this.mediaRepository = mediaRepository;
        this.storageClient = storageClient;
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

    public Media uploadMedia(MultipartFile file, String title, String altText) throws IOException, InterruptedException {
        String key = System.currentTimeMillis() + "_" + file.getOriginalFilename();

        // Upload to Supabase
        storageClient.uploadFile(bucket, key, file.getInputStream(), file.getSize(), file.getContentType());

        // Create public url
        String fileUrl = storageClient.getPublicUrl(bucket, key);

        // Create row in DB
        Media media = Media.builder()
                .fileUrl(fileUrl)
                .title(title)
                .altText(altText)
                .fileType(file.getContentType())
                .fileSize((int) file.getSize())
                .isVisible(true)
                .build();

        return mediaRepository.save(media);
    }
}
