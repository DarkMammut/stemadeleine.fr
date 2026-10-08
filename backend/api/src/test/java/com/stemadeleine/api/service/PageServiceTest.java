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
                .status(PublishingStatus.DRAFT)
                .isVisible(true)
                .sortOrder(1)
                .author(testUser)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
    }

    private Page publishedRow() {
        return Page.builder().id(UUID.randomUUID()).pageId(testPageId).name("Test Page").title("Test Page")
                .slug("test-page").version(1).status(PublishingStatus.PUBLISHED).isVisible(true).sortOrder(1)
                .author(testUser).build();
    }

    @Test
    @DisplayName("Retourne la ligne PUBLISHED d'une page")
    void shouldReturnPublishedPage() {
        Page published = publishedRow();
        when(pageRepository.findByPageIdAndStatus(testPageId, PublishingStatus.PUBLISHED)).thenReturn(Optional.of(published));

        assertEquals(published, pageService.getPublishedPage(testPageId).orElseThrow());
    }

    @Test
    @DisplayName("Retourne la ligne DRAFT d'une page")
    void shouldReturnDraftPage() {
        when(pageRepository.findByPageIdAndStatus(testPageId, PublishingStatus.DRAFT)).thenReturn(Optional.of(testPage));

        assertEquals(testPage, pageService.getLastVersion(testPageId).orElseThrow());
    }

    @Test
    @DisplayName("La page publiée par slug doit être visible")
    void shouldReturnPublishedVisiblePageBySlug() {
        Page published = publishedRow();
        when(pageRepository.findBySlugAndStatus("test-page", PublishingStatus.PUBLISHED)).thenReturn(List.of(published));

        assertTrue(pageService.getPublishedPageBySlug("test-page").isPresent());

        published.setIsVisible(false);
        assertTrue(pageService.getPublishedPageBySlug("test-page").isEmpty());
    }

    @Test
    @DisplayName("Crée une nouvelle page DRAFT à la racine")
    void shouldCreateNewDraftPage() {
        when(pageRepository.findMaxSortOrderByParentPageAndStatus(null, PublishingStatus.DRAFT)).thenReturn(2);
        when(pageRepository.findBySlugAndStatus(any(), eq(PublishingStatus.DRAFT))).thenReturn(List.of());
        when(pageRepository.save(any(Page.class))).thenAnswer(i -> i.getArgument(0));

        Page result = pageService.createNewPage(null, "Ma Page", testUser);

        assertEquals(PublishingStatus.DRAFT, result.getStatus());
        assertEquals(1, result.getVersion());
        assertEquals("/ma-page", result.getSlug());
        assertEquals(3, result.getSortOrder());
        assertFalse(result.getIsVisible());
    }

    @Test
    @DisplayName("La mise à jour modifie le draft en place et incrémente la version")
    void shouldUpdateDraftInPlace() {
        when(pageRepository.findByPageIdAndStatus(testPageId, PublishingStatus.DRAFT)).thenReturn(Optional.of(testPage));
        when(pageRepository.save(any(Page.class))).thenAnswer(i -> i.getArgument(0));

        Page result = pageService.updatePage(testPageId, null, "Nouveau titre", null, null, null, false, testUser);

        assertSame(testPage, result);
        assertEquals("Nouveau titre", result.getTitle());
        assertEquals(2, result.getVersion());
        assertEquals(PublishingStatus.DRAFT, result.getStatus());
        assertFalse(result.getIsVisible());
    }

    @Test
    @DisplayName("La mise à jour d'une page inexistante lève une exception")
    void shouldThrowWhenUpdatingUnknownPage() {
        when(pageRepository.findByPageIdAndStatus(testPageId, PublishingStatus.DRAFT)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> pageService.updatePage(testPageId, "x", null, null, null, null, null, testUser));
    }

    @Test
    @DisplayName("La publication crée la ligne PUBLISHED avec la version du draft")
    void shouldPublishDraftIntoNewPublishedRow() {
        testPage.setVersion(5);
        when(pageRepository.findByPageIdAndStatus(testPageId, PublishingStatus.DRAFT)).thenReturn(Optional.of(testPage));
        when(pageRepository.findByPageIdAndStatus(testPageId, PublishingStatus.PUBLISHED)).thenReturn(Optional.empty());
        when(pageRepository.findByParentPageAndStatus(testPage, PublishingStatus.DRAFT)).thenReturn(List.of());
        when(pageRepository.save(any(Page.class))).thenAnswer(i -> i.getArgument(0));

        Page published = pageService.publishPage(testPageId, testUser);

        assertEquals(PublishingStatus.PUBLISHED, published.getStatus());
        assertEquals(5, published.getVersion());
        assertEquals(testPageId, published.getPageId());
        assertEquals(PublishingStatus.DRAFT, testPage.getStatus());
    }

    @Test
    @DisplayName("La publication met à jour la ligne PUBLISHED existante")
    void shouldPublishDraftIntoExistingPublishedRow() {
        Page published = publishedRow();
        testPage.setVersion(7);
        testPage.setTitle("Draft title");
        when(pageRepository.findByPageIdAndStatus(testPageId, PublishingStatus.DRAFT)).thenReturn(Optional.of(testPage));
        when(pageRepository.findByPageIdAndStatus(testPageId, PublishingStatus.PUBLISHED)).thenReturn(Optional.of(published));
        when(pageRepository.findByParentPageAndStatus(testPage, PublishingStatus.DRAFT)).thenReturn(List.of());
        when(pageRepository.save(any(Page.class))).thenAnswer(i -> i.getArgument(0));

        Page result = pageService.publishPage(testPageId, testUser);

        assertSame(published, result);
        assertEquals(7, result.getVersion());
        assertEquals("Draft title", result.getTitle());
    }

    @Test
    @DisplayName("Publier une page dont le parent n'est pas publié échoue")
    void shouldFailPublishingWhenParentNotPublished() {
        UUID parentId = UUID.randomUUID();
        Page parent = Page.builder().id(UUID.randomUUID()).pageId(parentId).status(PublishingStatus.DRAFT).version(1).build();
        testPage.setParentPage(parent);
        when(pageRepository.findByPageIdAndStatus(testPageId, PublishingStatus.DRAFT)).thenReturn(Optional.of(testPage));
        when(pageRepository.findByPageIdAndStatus(parentId, PublishingStatus.PUBLISHED)).thenReturn(Optional.empty());

        assertThrows(IllegalStateException.class, () -> pageService.publishPage(testPageId, testUser));
    }

    @Test
    @DisplayName("La suppression passe le DRAFT en DELETED et le PUBLISHED en ARCHIVED")
    void shouldDeleteDraftAndArchivePublished() {
        Page published = publishedRow();
        when(pageRepository.findByPageIdAndStatus(testPageId, PublishingStatus.DRAFT)).thenReturn(Optional.of(testPage));
        when(pageRepository.findByPageId(testPageId)).thenReturn(List.of(testPage, published));
        when(pageRepository.findByParentPageAndStatus(any(), any())).thenReturn(List.of());

        pageService.delete(testPageId);

        assertEquals(PublishingStatus.DELETED, testPage.getStatus());
        assertEquals(PublishingStatus.ARCHIVED, published.getStatus());
        assertFalse(published.getIsVisible());
        verify(sectionService, times(2)).softDeleteSectionsOfPage(any(Page.class));
    }

    @Test
    @DisplayName("L'arbre du backoffice est construit à partir des pages DRAFT")
    void shouldBuildDraftTree() {
        Page child = Page.builder().id(UUID.randomUUID()).pageId(UUID.randomUUID()).name("Child").title("Child")
                .slug("/child").version(1).status(PublishingStatus.DRAFT).isVisible(true).sortOrder(1)
                .parentPage(testPage).build();
        when(pageRepository.findByStatus(PublishingStatus.DRAFT)).thenReturn(List.of(child, testPage));

        List<PageDto> tree = pageService.getDraftTree();

        assertEquals(1, tree.size());
        assertEquals(testPage.getId(), tree.get(0).id());
        assertEquals(1, tree.get(0).children().size());
        assertEquals(child.getId(), tree.get(0).children().get(0).id());
    }

    @Test
    @DisplayName("L'arbre public ne contient que les pages publiées et visibles")
    void shouldBuildPublicTreeWithVisiblePublishedPages() {
        Page visible = publishedRow();
        Page hidden = publishedRow();
        hidden.setIsVisible(false);
        when(pageRepository.findByStatus(PublishingStatus.PUBLISHED)).thenReturn(List.of(visible, hidden));

        List<PageDto> tree = pageService.findVisiblePagesHierarchyDto();

        assertEquals(1, tree.size());
        assertEquals(visible.getId(), tree.get(0).id());
    }

    @Test
    @DisplayName("Le hero media est défini sur le draft")
    void shouldSetHeroMediaOnDraft() {
        when(pageRepository.findByPageIdAndStatus(testPageId, PublishingStatus.DRAFT)).thenReturn(Optional.of(testPage));
        when(mediaRepository.findById(testMedia.getId())).thenReturn(Optional.of(testMedia));
        when(pageRepository.save(any(Page.class))).thenAnswer(i -> i.getArgument(0));

        Page result = pageService.setHeroMediaLastVersion(testPageId, testMedia.getId());

        assertEquals(testMedia, result.getHeroMedia());
        assertEquals(testPageId, testMedia.getOwnerId());
    }
}
