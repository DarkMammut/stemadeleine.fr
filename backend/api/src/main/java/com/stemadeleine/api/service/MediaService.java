package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateMediaRequest;
import com.stemadeleine.api.model.Media;
import com.stemadeleine.api.repository.MediaRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
public class MediaService {

    private final SupabaseStorageClient storageClient;
    private final MediaRepository mediaRepository;

    @Value("${supabase.storage.bucket:medias-dev}")
    private String bucket;

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
        // Nettoyer le nom de fichier pour supprimer les caractères spéciaux
        String cleanFileName = sanitizeFileName(file.getOriginalFilename());
        String key = System.currentTimeMillis() + "_" + cleanFileName;

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

    // Méthode pour nettoyer le nom de fichier
    private String sanitizeFileName(String originalFileName) {
        if (originalFileName == null) {
            return "file";
        }

        // Supprimer les caractères spéciaux et remplacer les espaces par des underscores
        return originalFileName
                .toLowerCase()
                .replaceAll("[àáâãäåæ]", "a")
                .replaceAll("[èéêë]", "e")
                .replaceAll("[ìíîï]", "i")
                .replaceAll("[òóôõöø]", "o")
                .replaceAll("[ùúûü]", "u")
                .replaceAll("[ýÿ]", "y")
                .replaceAll("[ç]", "c")
                .replaceAll("[ñ]", "n")
                .replaceAll("[^a-z0-9._-]", "_") // Remplacer tous les autres caractères spéciaux par _
                .replaceAll("_{2,}", "_") // Remplacer les underscores multiples par un seul
                .replaceAll("^_|_$", ""); // Supprimer les underscores en début/fin
    }

    public List<Media> getAllMedia() {
        log.info("Récupération de tous les médias");
        return mediaRepository.findAll();
    }

    public Optional<Media> getMediaById(UUID id) {
        log.info("Recherche du média avec l'ID : {}", id);
        return mediaRepository.findById(id);
    }

    public Media createMedia(CreateMediaRequest request) {
        log.info("Création d'un nouveau média");
        Media media = Media.builder()
                .fileUrl(request.fileUrl())
                .title(request.title())
                .altText(request.altText())
                .fileType(request.fileType())
                .fileSize(request.fileSize())
                .isVisible(true)
                .build();
        return mediaRepository.save(media);
    }

    public Optional<Media> updateMedia(UUID id, Media mediaDetails) {
        log.info("Mise à jour du média avec l'ID : {}", id);
        return mediaRepository.findById(id)
                .map(media -> {
                    media.setFileUrl(mediaDetails.getFileUrl());
                    media.setTitle(mediaDetails.getTitle());
                    media.setAltText(mediaDetails.getAltText());
                    media.setFileType(mediaDetails.getFileType());
                    media.setFileSize(mediaDetails.getFileSize());
                    media.setIsVisible(mediaDetails.getIsVisible());
                    media.setSortOrder(mediaDetails.getSortOrder());
                    return mediaRepository.save(media);
                });
    }

    public void deleteMedia(UUID id) {
        log.info("Suppression du média avec l'ID : {}", id);
        mediaRepository.deleteById(id);
    }

    public List<Media> searchMedia(String query) {
        log.info("Recherche de médias avec le terme : {}", query);
        return mediaRepository.findByTitleContainingIgnoreCaseOrAltTextContainingIgnoreCase(query, query);
    }

    public Optional<Media> updateSortOrder(UUID id, Integer sortOrder) {
        log.info("Mise à jour de l'ordre de tri du média avec l'ID : {}", id);
        return mediaRepository.findById(id)
                .map(media -> {
                    media.setSortOrder(sortOrder);
                    return mediaRepository.save(media);
                });
    }
}
