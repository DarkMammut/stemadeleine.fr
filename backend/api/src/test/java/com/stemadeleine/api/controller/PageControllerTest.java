package com.stemadeleine.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stemadeleine.api.dto.PageDto;
import com.stemadeleine.api.dto.PageEditDto;
import com.stemadeleine.api.dto.PageRequest;
import com.stemadeleine.api.dto.PageSectionDto;
import com.stemadeleine.api.mapper.PageEditMapper;
import com.stemadeleine.api.mapper.PageMapper;
import com.stemadeleine.api.mapper.PageSectionMapper;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.service.PageService;
import com.stemadeleine.api.service.SectionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("Tests unitaires du contrôleur PageController")
class PageControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private PageService pageService;

    @Mock
    private SectionService sectionService;

    @Mock
    private PageMapper pageMapper;

    @Mock
    private PageEditMapper pageEditMapper;

    @Mock
    private PageSectionMapper pageSectionMapper;

    private Page testPage;
    private PageDto testPageDto;
    private PageEditDto testPageEditDto;
    private PageSectionDto testPageSectionDto;
    private CustomUserDetails testUserDetails;

    @BeforeEach
    void setUp() {
        // Initialisation des objets de test
        testPage = createTestPage();
        testPageDto = createTestPageDto();
        testPageEditDto = createTestPageEditDto();
        testPageSectionDto = createTestPageSectionDto();

        // Création d'un utilisateur de test pour l'authentification
        User testUser = createTestUser();
        Account testAccount = createTestAccount(testUser);
        testUserDetails = new CustomUserDetails(testAccount);

        // Configuration des mocks par défaut pour les mappers (lenient to avoid unnecessary stubbing)
        lenient().when(pageMapper.toDto(any(Page.class))).thenReturn(testPageDto);
        lenient().when(pageMapper.toDtoList(anyList())).thenReturn(List.of(testPageDto));
        lenient().when(pageEditMapper.toDto(any(Page.class))).thenReturn(testPageEditDto);
        lenient().when(pageSectionMapper.toDto(any(Page.class), anyList())).thenReturn(testPageSectionDto);

        // build standalone MockMvc with controller using mocked dependencies
        PageController controller = new PageController(pageService, sectionService, pageMapper, pageEditMapper, pageSectionMapper);
        this.mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    @DisplayName("GET /api/pages - Doit retourner toutes les pages")
    void shouldReturnAllPages() throws Exception {
        // Given
        List<Page> pages = List.of(testPage);
        when(pageService.getAllPages()).thenReturn(pages);

        // When & Then
        mockMvc.perform(get("/api/pages"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("Test Page"));
    }

    @Test
    @DisplayName("GET /api/pages/tree - Doit retourner l'arbre des pages")
    void shouldReturnPageTree() throws Exception {
        // Given
        List<Page> pages = List.of(testPage);
        when(pageService.getLatestPagesForTree()).thenReturn(pages);

        // When & Then
        mockMvc.perform(get("/api/pages/tree"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("Test Page"));
    }

    @Test
    @DisplayName("GET /api/pages/slug/{slug} - Doit retourner une page par slug")
    void shouldReturnPageBySlug() throws Exception {
        // Given
        String slug = "test-page";
        when(pageService.getPublishedPageBySlug(slug)).thenReturn(Optional.of(testPage));

        // When & Then
        mockMvc.perform(get("/api/pages/slug/{slug}", slug))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.name").value("Test Page"));
    }

    @Test
    @DisplayName("GET /api/pages/slug/{slug} - Doit retourner 404 si page non trouvée")
    void shouldReturn404WhenPageNotFoundBySlug() throws Exception {
        // Given
        String slug = "non-existent-page";
        when(pageService.getPublishedPageBySlug(slug)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/api/pages/slug/{slug}", slug))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/pages/{pageId} - Doit retourner une page par ID")
    void shouldReturnPageById() throws Exception {
        // Given
        UUID pageId = UUID.randomUUID();
        when(pageService.getLastVersion(pageId)).thenReturn(Optional.of(testPage));

        // When & Then
        mockMvc.perform(get("/api/pages/{pageId}", pageId))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.name").value("Test Page"));
    }

    @Test
    @DisplayName("GET /api/pages/{pageId}/sections - Doit retourner une page avec ses sections")
    void shouldReturnPageWithSections() throws Exception {
        // Given
        UUID pageId = UUID.randomUUID();
        List<Section> sections = List.of(createTestSection());
        when(pageService.getLastVersion(pageId)).thenReturn(Optional.of(testPage));
        when(sectionService.getSectionsByPageId(pageId)).thenReturn(sections);

        // When & Then
        mockMvc.perform(get("/api/pages/{pageId}/sections", pageId))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.name").value("Test Page"));
    }

    @Test
    @DisplayName("POST /api/pages - Doit créer une nouvelle page")
    void shouldCreateNewPage() throws Exception {
        // Given
        PageRequest request = new PageRequest(null, UUID.randomUUID(), "New Page", "Title", "Subtitle", "new-page", "Description", true);

        // Mock des deux appels de service que fait maintenant le contrôleur
        when(pageService.createNewPage(any(UUID.class), eq("New Page"), any(User.class))).thenReturn(testPage);
        when(pageService.updatePage(any(UUID.class), eq("New Page"), eq("Title"), eq("Subtitle"), eq("new-page"), eq("Description"), eq(true), any(User.class)))
                .thenReturn(testPage);

        // When & Then — utiliser Security request post-processor 'user' pour fournir UserDetails
        mockMvc.perform(post("/api/pages")
                        .with(user(testUserDetails))
                        .requestAttr("CUSTOM_USER", testUserDetails)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.name").value("Test Page"));
    }

    @Test
    @DisplayName("PUT /api/pages/{pageId} - Doit mettre à jour une page")
    void shouldUpdatePage() throws Exception {
        // Given
        UUID pageId = UUID.randomUUID();
        PageRequest request = new PageRequest(pageId, null, "Updated Page", "Updated Title", "Updated Subtitle", "updated-page", "Updated Description", true);
        when(pageService.updatePage(eq(pageId), eq("Updated Page"), eq("Updated Title"), eq("Updated Subtitle"), eq("updated-page"), eq("Updated Description"), eq(true), any(User.class)))
                .thenReturn(testPage);

        mockMvc.perform(put("/api/pages/{pageId}", pageId)
                        .with(user(testUserDetails))
                        .requestAttr("CUSTOM_USER", testUserDetails)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.name").value("Test Page"));
    }

    @Test
    @DisplayName("DELETE /api/pages/{pageId} - Doit supprimer une page")
    void shouldDeletePage() throws Exception {
        // Given
        UUID pageId = UUID.randomUUID();

        mockMvc.perform(delete("/api/pages/{pageId}", pageId).with(user(testUserDetails)).requestAttr("CUSTOM_USER", testUserDetails))
                .andExpect(status().isNoContent());
    }

    // Méthodes utilitaires pour créer des objets de test
    private Page createTestPage() {
        return Page.builder()
                .id(UUID.randomUUID())
                .pageId(UUID.randomUUID())
                .name("Test Page")
                .title("Test Title")
                .subTitle("Test Subtitle")
                .slug("test-page")
                .description("Test Description")
                .status(PublishingStatus.PUBLISHED)
                .isVisible(true)
                .sortOrder(1)
                .version(1)
                .author(createTestUser()) // Ajout de l'auteur requis
                .build();
    }

    private User createTestUser() {
        return User.builder()
                .id(UUID.randomUUID())
                .firstname("Test")
                .lastname("User")
                .email("test@example.com")
                .build();
    }

    private Account createTestAccount(User user) {
        return Account.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .password("password")
                .role(Roles.ROLE_USER)
                .isActive(true)
                .emailVerified(true)
                .user(user)
                .build();
    }

    private PageDto createTestPageDto() {
        return new PageDto(
                UUID.randomUUID(),
                UUID.randomUUID(),
                "Test Page",
                "Test Title",
                "Test Subtitle",
                "test-page",
                "Test Description",
                PublishingStatus.PUBLISHED,
                1,
                true,
                List.of()
        );
    }

    private PageEditDto createTestPageEditDto() {
        return new PageEditDto(
                UUID.randomUUID(),
                UUID.randomUUID(),
                "Test Page",
                "Test Title",
                "Test Subtitle",
                "Test Description",
                "test-page",
                null,
                null,
                null,
                true
        );
    }

    private PageSectionDto createTestPageSectionDto() {
        return new PageSectionDto(
                UUID.randomUUID(),
                "Test Page",
                List.of() // sections
        );
    }

    private Section createTestSection() {
        Page testPage = createTestPage();
        return Section.builder()
                .id(UUID.randomUUID())
                .sectionId(UUID.randomUUID())
                .page(testPage)
                .name("Test Section")
                .version(1)
                .status(PublishingStatus.PUBLISHED)
                .sortOrder(1)
                .author(createTestUser()) // Ajout de l'auteur requis
                .build();
    }
}
