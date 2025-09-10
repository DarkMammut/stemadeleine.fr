package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateMediaRequest;
import com.stemadeleine.api.model.Media;
import com.stemadeleine.api.repository.MediaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests unitaires pour MediaService")
class MediaServiceTest {

    @Mock
    private MediaRepository mediaRepository;

    @InjectMocks
    private MediaService mediaService;

    private Media testMedia;
    private UUID testMediaId;

    @BeforeEach
    void setUp() {
        testMediaId = UUID.randomUUID();
        testMedia = Media.builder()
                .id(testMediaId)
                .fileUrl("https://example.com/test-image.jpg")
                .title("Test image")
                .altText("Test image alt text")
                .fileType("image/jpeg")
                .fileSize(1024)
                .isVisible(true)
                .sortOrder(1)
                .build();
    }

    @Test
    @DisplayName("Devrait retourner tous les médias")
    void shouldReturnAllMedia() {
        // Given
        List<Media> medias = List.of(testMedia);
        when(mediaRepository.findAll()).thenReturn(medias);

        // When
        List<Media> result = mediaService.getAllMedia();

        // Then
        assertEquals(1, result.size());
        assertEquals(testMedia.getTitle(), result.get(0).getTitle());
        assertEquals(testMedia.getFileUrl(), result.get(0).getFileUrl());
        verify(mediaRepository).findAll();
    }

    @Test
    @DisplayName("Devrait retourner un média par ID")
    void shouldReturnMediaById() {
        // Given
        when(mediaRepository.findById(testMediaId)).thenReturn(Optional.of(testMedia));

        // When
        Optional<Media> result = mediaService.getMediaById(testMediaId);

        // Then
        assertTrue(result.isPresent());
        assertEquals(testMedia.getId(), result.get().getId());
        assertEquals(testMedia.getTitle(), result.get().getTitle());
        assertEquals(testMedia.getFileUrl(), result.get().getFileUrl());
        verify(mediaRepository).findById(testMediaId);
    }

    @Test
    @DisplayName("Devrait retourner empty quand le média n'existe pas")
    void shouldReturnEmptyWhenMediaNotFound() {
        // Given
        when(mediaRepository.findById(testMediaId)).thenReturn(Optional.empty());

        // When
        Optional<Media> result = mediaService.getMediaById(testMediaId);

        // Then
        assertFalse(result.isPresent());
        verify(mediaRepository).findById(testMediaId);
    }

    @Test
    @DisplayName("Devrait créer un nouveau média")
    void shouldCreateNewMedia() {
        // Given
        CreateMediaRequest request = new CreateMediaRequest(
                "https://example.com/new-image.jpg",  // fileUrl
                "New image",                          // title
                "New image alt text",                 // altText
                "image/jpeg",                         // fileType
                2048                                  // fileSize
        );

        Media savedMedia = Media.builder()
                .id(UUID.randomUUID())
                .fileUrl(request.fileUrl())
                .title(request.title())
                .altText(request.altText())
                .fileType(request.fileType())
                .fileSize(request.fileSize())
                .isVisible(true)
                .build();

        when(mediaRepository.save(any(Media.class))).thenReturn(savedMedia);

        // When
        Media result = mediaService.createMedia(request);

        // Then
        assertEquals(request.fileUrl(), result.getFileUrl());
        assertEquals(request.title(), result.getTitle());
        assertEquals(request.altText(), result.getAltText());
        assertEquals(request.fileType(), result.getFileType());
        assertEquals(request.fileSize(), result.getFileSize());
        verify(mediaRepository).save(any(Media.class));
    }

    @Test
    @DisplayName("Devrait supprimer un média")
    void shouldDeleteMedia() {
        // When
        mediaService.deleteMedia(testMediaId);

        // Then
        verify(mediaRepository).deleteById(testMediaId);
    }

    @Test
    @DisplayName("Devrait supprimer un média même s'il n'existe pas")
    void shouldDeleteMediaEvenIfNotExists() {
        // When
        mediaService.deleteMedia(testMediaId);

        // Then
        verify(mediaRepository).deleteById(testMediaId);
    }
}
