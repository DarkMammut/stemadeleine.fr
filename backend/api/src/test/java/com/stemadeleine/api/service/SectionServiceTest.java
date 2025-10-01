package com.stemadeleine.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.repository.MediaRepository;
import com.stemadeleine.api.repository.SectionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests unitaires pour SectionService")
class SectionServiceTest {

    @Mock
    private SectionRepository sectionRepository;

    @Mock
    private PageService pageService;

    @Mock
    private MediaRepository mediaRepository;

    @Mock
    private ContentService contentService;

    @Mock
    private ModuleService moduleService;

    @InjectMocks
    private SectionService sectionService;

    private Section testSection;
    private UUID testSectionId;
    private UUID testPageId;
    private Page testPage;
    private User testUser;
    private Media testMedia;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        testSectionId = UUID.randomUUID();
        testPageId = UUID.randomUUID();
        objectMapper = new ObjectMapper();

        testUser = User.builder()
                .id(UUID.randomUUID())
                .firstname("Test")
                .lastname("User")
                .email("test@example.com")
                .build();

        testPage = Page.builder()
                .id(UUID.randomUUID())
                .pageId(testPageId)
                .name("Test Page")
                .title("Test Page Title")
                .slug("test-page")
                .version(1)
                .status(PublishingStatus.PUBLISHED)
                .isVisible(true)
                .sortOrder(1)
                .author(testUser)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        testMedia = Media.builder()
                .id(UUID.randomUUID())
                .fileUrl("https://example.com/test-image.jpg")
                .title("Test Image")
                .altText("Test image for unit tests")
                .fileType("image/jpeg")
                .fileSize(1024)
                .isVisible(true)
                .sortOrder(1)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        testSection = Section.builder()
                .id(UUID.randomUUID())
                .sectionId(testSectionId)
                .page(testPage)
                .name("Test Section")
                .title("Test Section Title")
                .version(1)
                .status(PublishingStatus.PUBLISHED)
                .isVisible(true)
                .sortOrder(1)
                .author(testUser)
                .media(testMedia)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Devrait retourner toutes les sections")
    void shouldReturnAllSections() {
        // Given
        List<Section> sections = List.of(testSection);
        when(sectionRepository.findAll()).thenReturn(sections);

        // When
        List<Section> result = sectionService.getAllSections();

        // Then
        assertEquals(1, result.size());
        assertEquals(testSection.getId(), result.get(0).getId());
        verify(sectionRepository).findAll();
    }

    @Test
    @DisplayName("Devrait retourner une section par ID")
    void shouldReturnSectionById() {
        // Given
        UUID sectionId = testSection.getId();
        when(sectionRepository.findById(sectionId)).thenReturn(Optional.of(testSection));

        // When
        Optional<Section> result = sectionService.getSectionById(sectionId);

        // Then
        assertTrue(result.isPresent());
        assertEquals(testSection.getId(), result.get().getId());
        assertEquals(testSection.getName(), result.get().getName());
        verify(sectionRepository).findById(sectionId);
    }

    @Test
    @DisplayName("Devrait retourner empty quand aucune section trouvée par ID")
    void shouldReturnEmptyWhenNoSectionFoundById() {
        // Given
        UUID sectionId = UUID.randomUUID();
        when(sectionRepository.findById(sectionId)).thenReturn(Optional.empty());

        // When
        Optional<Section> result = sectionService.getSectionById(sectionId);

        // Then
        assertFalse(result.isPresent());
        verify(sectionRepository).findById(sectionId);
    }

    @Test
    @DisplayName("Devrait retourner les sections par ID de page")
    void shouldReturnSectionsByPageId() {
        // Given
        List<Section> sections = List.of(testSection);
        when(pageService.getLastVersion(testPageId)).thenReturn(Optional.of(testPage));
        when(sectionRepository.findLastVersionsByPageId(testPage.getId())).thenReturn(sections);

        // When
        List<Section> result = sectionService.getSectionsByPageId(testPageId);

        // Then
        assertEquals(1, result.size());
        assertEquals(testSection.getId(), result.get(0).getId());
        verify(pageService).getLastVersion(testPageId);
        verify(sectionRepository).findLastVersionsByPageId(testPage.getId());
    }

    @Test
    @DisplayName("Devrait retourner une liste vide quand la page n'existe pas")
    void shouldReturnEmptyListWhenPageNotFound() {
        // Given
        when(pageService.getLastVersion(testPageId)).thenReturn(Optional.empty());

        // When
        List<Section> result = sectionService.getSectionsByPageId(testPageId);

        // Then
        assertTrue(result.isEmpty());
        verify(pageService).getLastVersion(testPageId);
        verify(sectionRepository, never()).findLastVersionsByPageId(any());
    }

    @Test
    @DisplayName("Devrait retourner la dernière version d'une section")
    void shouldReturnLastVersionOfSection() {
        // Given
        when(sectionRepository.findTopBySectionIdOrderByVersionDesc(testSectionId)).thenReturn(Optional.of(testSection));

        // When
        Optional<Section> result = sectionService.getLastVersion(testSectionId);

        // Then
        assertTrue(result.isPresent());
        assertEquals(testSection.getId(), result.get().getId());
        verify(sectionRepository).findTopBySectionIdOrderByVersionDesc(testSectionId);
    }

    @Test
    @DisplayName("Devrait créer une nouvelle section")
    void shouldCreateNewSection() {
        // Given
        String sectionName = "New Section";
        Section savedSection = Section.builder()
                .id(UUID.randomUUID())
                .sectionId(UUID.randomUUID())
                .page(testPage)
                .name(sectionName)
                .title(sectionName)
                .version(1)
                .status(PublishingStatus.DRAFT)
                .isVisible(false)
                .sortOrder(1)
                .author(testUser)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        when(pageService.getLastVersion(testPageId)).thenReturn(Optional.of(testPage));
        when(sectionRepository.findMaxSortOrderByPage(testPage.getId())).thenReturn(0);
        when(sectionRepository.save(any(Section.class))).thenReturn(savedSection);

        // When
        Section result = sectionService.createNewSection(testPageId, sectionName, testUser);

        // Then
        assertNotNull(result);
        assertEquals(sectionName, result.getName());
        assertEquals(sectionName, result.getTitle());
        assertEquals(PublishingStatus.DRAFT, result.getStatus());
        assertFalse(result.getIsVisible());
        assertEquals(1, result.getSortOrder());
        verify(pageService).getLastVersion(testPageId);
        verify(sectionRepository).findMaxSortOrderByPage(testPage.getId());
        verify(sectionRepository).save(any(Section.class));
    }

    @Test
    @DisplayName("Devrait lever une exception quand la page parent n'existe pas lors de la création")
    void shouldThrowExceptionWhenParentPageNotFoundOnCreate() {
        // Given
        String sectionName = "New Section";
        when(pageService.getLastVersion(testPageId)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> sectionService.createNewSection(testPageId, sectionName, testUser));

        assertEquals("Page not found with id: " + testPageId, exception.getMessage());
        verify(pageService).getLastVersion(testPageId);
        verify(sectionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Devrait mettre à jour une section")
    void shouldUpdateSection() {
        // Given
        String newName = "Updated Section";
        String newTitle = "Updated Title";
        Boolean newVisibility = false;

        when(sectionRepository.findTopBySectionIdOrderByVersionDesc(testSectionId)).thenReturn(Optional.of(testSection));
        when(sectionRepository.save(any(Section.class))).thenReturn(testSection);

        // When
        Section result = sectionService.updateSection(testSectionId, newName, newTitle, newVisibility, testUser);

        // Then
        assertNotNull(result);
        verify(sectionRepository).findTopBySectionIdOrderByVersionDesc(testSectionId);
        verify(sectionRepository).save(testSection);
    }

    @Test
    @DisplayName("Devrait lever une exception lors de la mise à jour d'une section inexistante")
    void shouldThrowExceptionWhenUpdatingNonExistentSection() {
        // Given
        String newName = "Updated Section";
        when(sectionRepository.findTopBySectionIdOrderByVersionDesc(testSectionId)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> sectionService.updateSection(testSectionId, newName, null, null, testUser));

        assertEquals("Section not found: " + testSectionId, exception.getMessage());
        verify(sectionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Devrait ajouter du contenu à une section")
    void shouldAddContentToSection() {
        // Given
        String contentTitle = "Test Content";
        JsonNode contentBody = objectMapper.createObjectNode().put("text", "Test content body");
        Content mockContent = Content.builder()
                .id(UUID.randomUUID())
                .title(contentTitle)
                .body(contentBody)
                .ownerId(testSectionId)
                .author(testUser)
                .build();

        when(sectionRepository.findTopBySectionIdOrderByVersionDesc(testSectionId)).thenReturn(Optional.of(testSection));
        when(contentService.createContent(contentTitle, contentBody, testSectionId, testUser)).thenReturn(mockContent);

        // When
        Content result = sectionService.addContentToSection(testSectionId, contentTitle, contentBody, testUser);

        // Then
        assertNotNull(result);
        assertEquals(contentTitle, result.getTitle());
        verify(sectionRepository).findTopBySectionIdOrderByVersionDesc(testSectionId);
        verify(contentService).createContent(contentTitle, contentBody, testSectionId, testUser);
    }

    @Test
    @DisplayName("Devrait créer un nouveau contenu avec des valeurs par défaut")
    void shouldCreateNewContentWithDefaultValues() {
        // Given
        String contentTitle = "New Content";
        JsonNode defaultBody = objectMapper.createObjectNode().put("default", "body");
        Content mockContent = Content.builder()
                .id(UUID.randomUUID())
                .title(contentTitle)
                .body(defaultBody)
                .ownerId(testSectionId)
                .author(testUser)
                .build();

        when(contentService.createDefaultBody()).thenReturn(defaultBody);
        when(sectionRepository.findTopBySectionIdOrderByVersionDesc(testSectionId)).thenReturn(Optional.of(testSection));
        when(contentService.createContent(contentTitle, defaultBody, testSectionId, testUser)).thenReturn(mockContent);

        // When
        Content result = sectionService.createNewContent(testSectionId, contentTitle, testUser);

        // Then
        assertNotNull(result);
        assertEquals(contentTitle, result.getTitle());
        verify(contentService).createDefaultBody();
        verify(contentService).createContent(contentTitle, defaultBody, testSectionId, testUser);
    }

    @Test
    @DisplayName("Devrait retourner les contenus d'une section")
    void shouldReturnContentsBySection() {
        // Given
        List<Content> mockContents = List.of(
                Content.builder().id(UUID.randomUUID()).title("Content 1").ownerId(testSectionId).build(),
                Content.builder().id(UUID.randomUUID()).title("Content 2").ownerId(testSectionId).build()
        );
        when(contentService.getLatestContentsByOwner(testSectionId)).thenReturn(mockContents);

        // When
        List<Content> result = sectionService.getContentsBySection(testSectionId);

        // Then
        assertEquals(2, result.size());
        verify(contentService).getLatestContentsByOwner(testSectionId);
    }

    @Test
    @DisplayName("Devrait définir un média pour une section")
    void shouldSetSectionMedia() {
        // Given
        UUID mediaId = testMedia.getId();
        when(sectionRepository.findTopBySectionIdOrderByVersionDesc(testSectionId)).thenReturn(Optional.of(testSection));
        when(mediaRepository.findById(mediaId)).thenReturn(Optional.of(testMedia));
        when(mediaRepository.save(testMedia)).thenReturn(testMedia);
        when(sectionRepository.save(any(Section.class))).thenReturn(testSection);

        // When
        Section result = sectionService.setSectionMedia(testSectionId, mediaId, testUser);

        // Then
        assertNotNull(result);
        verify(sectionRepository).findTopBySectionIdOrderByVersionDesc(testSectionId);
        verify(mediaRepository).findById(mediaId);
        verify(mediaRepository).save(testMedia);
        verify(sectionRepository).save(any(Section.class));
    }

    @Test
    @DisplayName("Devrait lever une exception quand le média n'existe pas lors de l'association")
    void shouldThrowExceptionWhenMediaNotFoundOnSet() {
        // Given
        UUID mediaId = UUID.randomUUID();
        when(sectionRepository.findTopBySectionIdOrderByVersionDesc(testSectionId)).thenReturn(Optional.of(testSection));
        when(mediaRepository.findById(mediaId)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> sectionService.setSectionMedia(testSectionId, mediaId, testUser));

        assertEquals("Media not found: " + mediaId, exception.getMessage());
        verify(sectionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Devrait lever une exception quand la section n'existe pas lors de l'association de média")
    void shouldThrowExceptionWhenSectionNotFoundOnSetMedia() {
        // Given
        UUID mediaId = testMedia.getId();
        when(sectionRepository.findTopBySectionIdOrderByVersionDesc(testSectionId)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> sectionService.setSectionMedia(testSectionId, mediaId, testUser));

        assertEquals("Section not found: " + testSectionId, exception.getMessage());
        verify(mediaRepository, never()).findById(any());
        verify(sectionRepository, never()).save(any());
    }
}
