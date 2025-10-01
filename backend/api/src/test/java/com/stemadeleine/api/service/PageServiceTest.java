package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.PageDto;
import com.stemadeleine.api.model.Media;
import com.stemadeleine.api.model.Page;
import com.stemadeleine.api.model.PublishingStatus;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.MediaRepository;
import com.stemadeleine.api.repository.PageRepository;
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
@DisplayName("Tests unitaires pour PageService")
class PageServiceTest {

    @Mock
    private PageRepository pageRepository;

    @Mock
    private MediaRepository mediaRepository;

    @Mock
    private SectionService sectionService;

    @InjectMocks
    private PageService pageService;

    private Page testPage;
    private UUID testPageId;
    private User testUser;
    private Media testMedia;

    @BeforeEach
    void setUp() {
        testPageId = UUID.randomUUID();

        testUser = User.builder()
                .id(UUID.randomUUID())
                .firstname("Test")
                .lastname("User")
                .email("test@example.com")
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

        testPage = Page.builder()
                .id(UUID.randomUUID())
                .pageId(testPageId)
                .name("Test Page")
                .title("Test Page")
                .subTitle("Test Subtitle")
                .slug("test-page")
                .description("Test Description")
                .version(1)
                .status(PublishingStatus.PUBLISHED)
                .isVisible(true)
                .sortOrder(1)
                .author(testUser)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Devrait retourner une page publiée par ID")
    void shouldReturnPublishedPageById() {
        // Given
        when(pageRepository.findTopByPageIdAndStatusOrderByVersionDesc(testPageId, PublishingStatus.PUBLISHED))
                .thenReturn(Optional.of(testPage));

        // When
        Optional<Page> result = pageService.getPublishedPage(testPageId);

        // Then
        assertTrue(result.isPresent());
        assertEquals(testPage.getId(), result.get().getId());
        assertEquals(testPage.getTitle(), result.get().getTitle());
        verify(pageRepository).findTopByPageIdAndStatusOrderByVersionDesc(testPageId, PublishingStatus.PUBLISHED);
    }

    @Test
    @DisplayName("Devrait retourner empty quand aucune page publiée trouvée")
    void shouldReturnEmptyWhenNoPublishedPageFound() {
        // Given
        when(pageRepository.findTopByPageIdAndStatusOrderByVersionDesc(testPageId, PublishingStatus.PUBLISHED))
                .thenReturn(Optional.empty());

        // When
        Optional<Page> result = pageService.getPublishedPage(testPageId);

        // Then
        assertFalse(result.isPresent());
        verify(pageRepository).findTopByPageIdAndStatusOrderByVersionDesc(testPageId, PublishingStatus.PUBLISHED);
    }

    @Test
    @DisplayName("Devrait retourner une page publiée par slug")
    void shouldReturnPublishedPageBySlug() {
        // Given
        String slug = "test-page";
        when(pageRepository.findBySlug(slug)).thenReturn(Optional.of(testPage));

        // When
        Optional<Page> result = pageService.getPublishedPageBySlug(slug);

        // Then
        assertTrue(result.isPresent());
        assertEquals(testPage.getSlug(), result.get().getSlug());
        assertTrue(result.get().getIsVisible());
        verify(pageRepository).findBySlug(slug);
    }

    @Test
    @DisplayName("Devrait retourner empty pour une page non visible par slug")
    void shouldReturnEmptyForInvisiblePageBySlug() {
        // Given
        String slug = "test-page";
        Page invisiblePage = Page.builder()
                .id(testPage.getId())
                .pageId(testPage.getPageId())
                .name(testPage.getName())
                .title(testPage.getTitle())
                .subTitle(testPage.getSubTitle())
                .slug(testPage.getSlug())
                .description(testPage.getDescription())
                .version(testPage.getVersion())
                .status(testPage.getStatus())
                .isVisible(false) // La seule différence
                .sortOrder(testPage.getSortOrder())
                .author(testPage.getAuthor())
                .createdAt(testPage.getCreatedAt())
                .updatedAt(testPage.getUpdatedAt())
                .build();
        when(pageRepository.findBySlug(slug)).thenReturn(Optional.of(invisiblePage));

        // When
        Optional<Page> result = pageService.getPublishedPageBySlug(slug);

        // Then
        assertFalse(result.isPresent());
        verify(pageRepository).findBySlug(slug);
    }

    @Test
    @DisplayName("Devrait retourner la dernière version d'une page")
    void shouldReturnLastVersionOfPage() {
        // Given
        when(pageRepository.findTopByPageIdOrderByVersionDesc(testPageId)).thenReturn(Optional.of(testPage));

        // When
        Optional<Page> result = pageService.getLastVersion(testPageId);

        // Then
        assertTrue(result.isPresent());
        assertEquals(testPage.getId(), result.get().getId());
        verify(pageRepository).findTopByPageIdOrderByVersionDesc(testPageId);
    }

    @Test
    @DisplayName("Devrait retourner toutes les pages")
    void shouldReturnAllPages() {
        // Given
        List<Page> pages = List.of(testPage);
        when(pageRepository.findAll()).thenReturn(pages);

        // When
        List<Page> result = pageService.getAllPages();

        // Then
        assertEquals(1, result.size());
        assertEquals(testPage.getId(), result.get(0).getId());
        verify(pageRepository).findAll();
    }

    @Test
    @DisplayName("Devrait créer une nouvelle page")
    void shouldCreateNewPage() {
        // Given
        UUID parentPageId = UUID.randomUUID();
        String pageName = "New Page";

        // Créer une page parent pour le mock
        Page parentPage = Page.builder()
                .id(UUID.randomUUID())
                .pageId(parentPageId)
                .name("Parent Page")
                .title("Parent Title")
                .subTitle("Parent Subtitle")
                .slug("parent-page")
                .description("Parent Description")
                .version(1)
                .status(PublishingStatus.PUBLISHED)
                .isVisible(true)
                .sortOrder(1)
                .author(testUser)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        Page savedPage = Page.builder()
                .id(UUID.randomUUID())
                .pageId(UUID.randomUUID())
                .name(pageName)
                .title(pageName)
                .subTitle("")
                .slug("new-page")
                .description("")
                .version(1)
                .status(PublishingStatus.DRAFT)
                .isVisible(true)
                .sortOrder(1)
                .author(testUser)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        // Mock pour la page parent
        when(pageRepository.findTopByPageIdOrderByVersionDesc(parentPageId)).thenReturn(Optional.of(parentPage));
        // Mock pour l'ordre de tri
        when(pageRepository.findMaxSortOrderByParentPage(parentPageId)).thenReturn(0);
        when(pageRepository.save(any(Page.class))).thenReturn(savedPage);

        // When
        Page result = pageService.createNewPage(parentPageId, pageName, testUser);

        // Then
        assertNotNull(result);
        assertEquals(pageName, result.getName());
        verify(pageRepository).findTopByPageIdOrderByVersionDesc(parentPageId);
        verify(pageRepository).findMaxSortOrderByParentPage(parentPageId);
        verify(pageRepository).save(any(Page.class));
    }

    @Test
    @DisplayName("Devrait mettre à jour une page")
    void shouldUpdatePage() {
        // Given
        String newName = "Updated Page";
        String newTitle = "Updated Title";
        String newSubTitle = "Updated Subtitle";
        String newSlug = "updated-slug";
        String newDescription = "Updated Description";
        Boolean newVisibility = false;

        Page updatedPage = Page.builder()
                .id(testPage.getId())
                .pageId(testPage.getPageId())
                .name(newName)
                .title(newTitle)
                .subTitle(newSubTitle)
                .slug(newSlug)
                .description(newDescription)
                .version(2)
                .status(testPage.getStatus())
                .isVisible(newVisibility)
                .sortOrder(testPage.getSortOrder())
                .author(testPage.getAuthor())
                .createdAt(testPage.getCreatedAt())
                .updatedAt(testPage.getUpdatedAt())
                .build();

        when(pageRepository.findTopByPageIdOrderByVersionDesc(testPageId)).thenReturn(Optional.of(testPage));
        when(pageRepository.save(any(Page.class))).thenReturn(updatedPage);

        // When
        Page result = pageService.updatePage(testPageId, newName, newTitle, newSubTitle, newSlug, newDescription, newVisibility, testUser);

        // Then
        assertNotNull(result);
        assertEquals(newName, result.getName());
        assertEquals(newTitle, result.getTitle());
        assertEquals(2, result.getVersion());
        verify(pageRepository).findTopByPageIdOrderByVersionDesc(testPageId);
        verify(pageRepository).save(any(Page.class));
    }

    @Test
    @DisplayName("Devrait lever une exception lors de la mise à jour d'une page inexistante")
    void shouldThrowExceptionWhenUpdatingNonExistentPage() {
        // Given
        when(pageRepository.findTopByPageIdOrderByVersionDesc(testPageId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () ->
                pageService.updatePage(testPageId, "New Name", "New Title", "New Subtitle", "new-slug", "New Description", true, testUser));

        verify(pageRepository).findTopByPageIdOrderByVersionDesc(testPageId);
        verify(pageRepository, never()).save(any(Page.class));
    }

    @Test
    @DisplayName("Devrait mettre à jour la visibilité d'une page")
    void shouldUpdatePageVisibility() {
        // Given
        Boolean newVisibility = false;
        Page updatedPage = Page.builder()
                .id(testPage.getId())
                .pageId(testPage.getPageId())
                .name(testPage.getName())
                .title(testPage.getTitle())
                .subTitle(testPage.getSubTitle())
                .slug(testPage.getSlug())
                .description(testPage.getDescription())
                .version(2)
                .status(testPage.getStatus())
                .isVisible(newVisibility)
                .sortOrder(testPage.getSortOrder())
                .author(testPage.getAuthor())
                .createdAt(testPage.getCreatedAt())
                .updatedAt(testPage.getUpdatedAt())
                .build();

        when(pageRepository.findTopByPageIdOrderByVersionDesc(testPageId)).thenReturn(Optional.of(testPage));
        when(pageRepository.save(any(Page.class))).thenReturn(updatedPage);

        // When
        Page result = pageService.updatePageVisibility(testPageId, newVisibility, testUser);

        // Then
        assertNotNull(result);
        assertEquals(newVisibility, result.getIsVisible());
        assertEquals(2, result.getVersion());
        verify(pageRepository).save(any(Page.class));
    }

    @Test
    @DisplayName("Devrait définir le média hero de la dernière version")
    void shouldSetHeroMediaLastVersion() {
        // Given
        UUID heroMediaId = UUID.randomUUID();
        Page updatedPage = Page.builder()
                .id(testPage.getId())
                .pageId(testPage.getPageId())
                .name(testPage.getName())
                .title(testPage.getTitle())
                .subTitle(testPage.getSubTitle())
                .slug(testPage.getSlug())
                .description(testPage.getDescription())
                .version(2)
                .status(testPage.getStatus())
                .isVisible(testPage.getIsVisible())
                .sortOrder(testPage.getSortOrder())
                .author(testPage.getAuthor())
                .heroMedia(testMedia) // Media ajouté
                .createdAt(testPage.getCreatedAt())
                .updatedAt(testPage.getUpdatedAt())
                .build();

        when(pageRepository.findTopByPageIdOrderByVersionDesc(testPageId)).thenReturn(Optional.of(testPage));
        when(mediaRepository.findById(heroMediaId)).thenReturn(Optional.of(testMedia));
        when(pageRepository.save(any(Page.class))).thenReturn(updatedPage);

        // When
        Page result = pageService.setHeroMediaLastVersion(testPageId, heroMediaId);

        // Then
        assertNotNull(result);
        assertEquals(testMedia, result.getHeroMedia());
        verify(pageRepository).save(any(Page.class));
        verify(mediaRepository).findById(heroMediaId);
    }

    @Test
    @DisplayName("Devrait lever une exception si le média hero n'existe pas")
    void shouldThrowExceptionWhenHeroMediaNotFound() {
        // Given
        UUID heroMediaId = UUID.randomUUID();
        when(pageRepository.findTopByPageIdOrderByVersionDesc(testPageId)).thenReturn(Optional.of(testPage));
        when(mediaRepository.findById(heroMediaId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () ->
                pageService.setHeroMediaLastVersion(testPageId, heroMediaId));

        verify(mediaRepository).findById(heroMediaId);
        verify(pageRepository, never()).save(any(Page.class));
    }

    @Test
    @DisplayName("Devrait supprimer le média hero de la dernière version")
    void shouldRemoveHeroMediaLastVersion() {
        // Given
        Page pageWithHero = Page.builder()
                .id(testPage.getId())
                .pageId(testPage.getPageId())
                .name(testPage.getName())
                .title(testPage.getTitle())
                .subTitle(testPage.getSubTitle())
                .slug(testPage.getSlug())
                .description(testPage.getDescription())
                .version(testPage.getVersion())
                .status(testPage.getStatus())
                .isVisible(testPage.getIsVisible())
                .sortOrder(testPage.getSortOrder())
                .author(testPage.getAuthor())
                .heroMedia(testMedia) // Avec media
                .createdAt(testPage.getCreatedAt())
                .updatedAt(testPage.getUpdatedAt())
                .build();

        Page updatedPage = Page.builder()
                .id(testPage.getId())
                .pageId(testPage.getPageId())
                .name(testPage.getName())
                .title(testPage.getTitle())
                .subTitle(testPage.getSubTitle())
                .slug(testPage.getSlug())
                .description(testPage.getDescription())
                .version(2)
                .status(testPage.getStatus())
                .isVisible(testPage.getIsVisible())
                .sortOrder(testPage.getSortOrder())
                .author(testPage.getAuthor())
                .heroMedia(null) // Media supprimé
                .createdAt(testPage.getCreatedAt())
                .updatedAt(testPage.getUpdatedAt())
                .build();

        when(pageRepository.findTopByPageIdOrderByVersionDesc(testPageId)).thenReturn(Optional.of(pageWithHero));
        when(pageRepository.save(any(Page.class))).thenReturn(updatedPage);

        // When
        Page result = pageService.removeHeroMediaLastVersion(testPageId);

        // Then
        assertNotNull(result);
        assertNull(result.getHeroMedia());
        verify(pageRepository).save(any(Page.class));
    }

    @Test
    @DisplayName("Devrait supprimer logiquement une page")
    void shouldDeletePageLogically() {
        // Given
        when(pageRepository.findTopByPageIdOrderByVersionDesc(testPageId)).thenReturn(Optional.of(testPage));

        // When
        pageService.delete(testPageId);

        // Then
        verify(pageRepository).findTopByPageIdOrderByVersionDesc(testPageId);
        verify(pageRepository).softDeleteById(testPage.getId());
    }

    @Test
    @DisplayName("Devrait créer une nouvelle version de page")
    void shouldCreatePageVersion() {
        // Given
        String newName = "Version 2";
        String newTitle = "Version 2 Title";
        Page newVersion = Page.builder()
                .id(UUID.randomUUID()) // Nouvel ID
                .pageId(testPage.getPageId()) // Même pageId
                .name(newName)
                .title(newTitle)
                .subTitle(testPage.getSubTitle())
                .slug(testPage.getSlug())
                .description(testPage.getDescription())
                .version(2)
                .status(PublishingStatus.DRAFT)
                .isVisible(testPage.getIsVisible())
                .sortOrder(testPage.getSortOrder())
                .author(testPage.getAuthor())
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        when(pageRepository.findTopByPageIdOrderByVersionDesc(testPageId)).thenReturn(Optional.of(testPage));
        when(pageRepository.save(any(Page.class))).thenReturn(newVersion);

        // When
        Page result = pageService.createPageVersion(testPageId, newName, newTitle, "New Subtitle", "new-slug", "New Description", true, testUser);

        // Then
        assertNotNull(result);
        assertEquals(newName, result.getName());
        assertEquals(2, result.getVersion());
        assertEquals(PublishingStatus.DRAFT, result.getStatus());
        verify(pageRepository).save(any(Page.class));
    }

    @Test
    @DisplayName("Devrait publier une page")
    void shouldPublishPage() {
        // Given
        Page draftPage = Page.builder()
                .id(testPage.getId())
                .pageId(testPage.getPageId())
                .name(testPage.getName())
                .title(testPage.getTitle())
                .subTitle(testPage.getSubTitle())
                .slug(testPage.getSlug())
                .description(testPage.getDescription())
                .version(testPage.getVersion())
                .status(PublishingStatus.DRAFT)
                .isVisible(testPage.getIsVisible())
                .sortOrder(testPage.getSortOrder())
                .author(testPage.getAuthor())
                .createdAt(testPage.getCreatedAt())
                .updatedAt(testPage.getUpdatedAt())
                .build();

        Page publishedPage = Page.builder()
                .id(testPage.getId())
                .pageId(testPage.getPageId())
                .name(testPage.getName())
                .title(testPage.getTitle())
                .subTitle(testPage.getSubTitle())
                .slug(testPage.getSlug())
                .description(testPage.getDescription())
                .version(testPage.getVersion())
                .status(PublishingStatus.PUBLISHED)
                .isVisible(testPage.getIsVisible())
                .sortOrder(testPage.getSortOrder())
                .author(testPage.getAuthor())
                .createdAt(testPage.getCreatedAt())
                .updatedAt(testPage.getUpdatedAt())
                .build();

        when(pageRepository.findTopByPageIdOrderByVersionDesc(testPageId)).thenReturn(Optional.of(draftPage));
        when(pageRepository.save(any(Page.class))).thenReturn(publishedPage);

        // When
        Page result = pageService.publishPage(testPageId, testUser);

        // Then
        assertNotNull(result);
        assertEquals(PublishingStatus.PUBLISHED, result.getStatus());
        verify(pageRepository).save(any(Page.class));
    }

    @Test
    @DisplayName("Devrait mettre à jour l'arbre des pages")
    void shouldUpdatePageTree() {
        // Given
        PageDto pageDto1 = new PageDto(testPage.getId(), testPageId, "Page 1", "Title 1", "Subtitle 1", "page-1", "Description 1", PublishingStatus.PUBLISHED, 1, true, List.of());
        PageDto pageDto2 = new PageDto(UUID.randomUUID(), UUID.randomUUID(), "Page 2", "Title 2", "Subtitle 2", "page-2", "Description 2", PublishingStatus.PUBLISHED, 2, true, List.of());
        List<PageDto> tree = List.of(pageDto1, pageDto2);

        when(pageRepository.findById(any(UUID.class))).thenReturn(Optional.of(testPage));
        when(pageRepository.save(any(Page.class))).thenReturn(testPage);

        // When
        pageService.updatePageTree(tree, null);

        // Then
        verify(pageRepository, atLeastOnce()).findById(any(UUID.class));
        verify(pageRepository, atLeastOnce()).save(any(Page.class));
    }

    @Test
    @DisplayName("Devrait retourner les dernières pages pour l'arbre")
    void shouldReturnLatestPagesForTree() {
        // Given
        List<Page> pages = List.of(testPage);
        when(pageRepository.findAll()).thenReturn(pages);

        // When
        List<Page> result = pageService.getLatestPagesForTree();

        // Then
        assertEquals(1, result.size());
        assertEquals(testPage.getId(), result.get(0).getId());
        verify(pageRepository).findAll();
    }
}
