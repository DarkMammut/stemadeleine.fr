package com.stemadeleine.api.service;

import com.stemadeleine.api.model.Page;
import com.stemadeleine.api.model.PublishingStatus;
import com.stemadeleine.api.repository.MediaRepository;
import com.stemadeleine.api.repository.PageRepository;
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
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests unitaires pour PageService")
class PageServiceTest {

    @Mock
    private PageRepository pageRepository;

    @Mock
    private MediaRepository mediaRepository;

    @InjectMocks
    private PageService pageService;

    private Page testPage;
    private UUID testPageId;

    @BeforeEach
    void setUp() {
        testPageId = UUID.randomUUID();
        testPage = Page.builder()
                .id(UUID.randomUUID())
                .pageId(testPageId)
                .title("Test Page")
                .slug("test-page")
                .version(1)
                .status(PublishingStatus.PUBLISHED)
                .isVisible(true)
                .sortOrder(1)
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
        verify(pageRepository).findBySlug(slug);
    }

    @Test
    @DisplayName("Devrait retourner empty pour une page invisible même si elle existe")
    void shouldReturnEmptyForInvisiblePage() {
        // Given
        String slug = "test-page";
        Page invisiblePage = Page.builder()
                .id(UUID.randomUUID())
                .pageId(testPageId)
                .title("Invisible Page")
                .slug(slug)
                .isVisible(false)
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
        when(pageRepository.findTopByPageIdOrderByVersionDesc(testPageId))
                .thenReturn(Optional.of(testPage));

        // When
        Optional<Page> result = pageService.getLastVersion(testPageId);

        // Then
        assertTrue(result.isPresent());
        assertEquals(testPage.getVersion(), result.get().getVersion());
        verify(pageRepository).findTopByPageIdOrderByVersionDesc(testPageId);
    }

    @Test
    @DisplayName("Devrait retourner les pages pour l'arborescence triées par sortOrder")
    void shouldReturnPagesForTreeSortedBySortOrder() {
        // Given
        Page page1 = Page.builder()
                .pageId(UUID.randomUUID())
                .title("Page 1")
                .version(1)
                .status(PublishingStatus.PUBLISHED)
                .sortOrder(2)
                .build();

        Page page2 = Page.builder()
                .pageId(UUID.randomUUID())
                .title("Page 2")
                .version(1)
                .status(PublishingStatus.PUBLISHED)
                .sortOrder(1)
                .build();

        when(pageRepository.findAll()).thenReturn(List.of(page1, page2));

        // When
        List<Page> result = pageService.getLatestPagesForTree();

        // Then
        assertEquals(2, result.size());
        assertEquals("Page 2", result.get(0).getTitle()); // sortOrder 1 en premier
        assertEquals("Page 1", result.get(1).getTitle()); // sortOrder 2 en second
        verify(pageRepository).findAll();
    }

    @Test
    @DisplayName("Devrait exclure les pages supprimées de l'arborescence")
    void shouldExcludeDeletedPagesFromTree() {
        // Given
        Page publishedPage = Page.builder()
                .pageId(UUID.randomUUID())
                .title("Published Page")
                .version(1)
                .status(PublishingStatus.PUBLISHED)
                .sortOrder(1)
                .build();

        Page deletedPage = Page.builder()
                .pageId(UUID.randomUUID())
                .title("Deleted Page")
                .version(1)
                .status(PublishingStatus.DELETED)
                .sortOrder(2)
                .build();

        when(pageRepository.findAll()).thenReturn(List.of(publishedPage, deletedPage));

        // When
        List<Page> result = pageService.getLatestPagesForTree();

        // Then
        assertEquals(1, result.size());
        assertEquals("Published Page", result.get(0).getTitle());
        verify(pageRepository).findAll();
    }
}
