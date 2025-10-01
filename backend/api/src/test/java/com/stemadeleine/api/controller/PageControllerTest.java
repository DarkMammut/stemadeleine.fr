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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.anyList;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc(addFilters = false) // Désactive tous les filtres de sécurité
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration"
})
@DisplayName("Tests unitaires du contrôleur PageController")
class PageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PageService pageService;

    @MockBean
    private SectionService sectionService;

    @MockBean
    private PageMapper pageMapper;

    @MockBean
    private PageEditMapper pageEditMapper;

    @MockBean
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

        // Configuration des mocks par défaut pour les mappers
        when(pageMapper.toDto(any(Page.class))).thenReturn(testPageDto);
        when(pageMapper.toDtoList(anyList())).thenReturn(List.of(testPageDto));
        when(pageEditMapper.toDto(any(Page.class))).thenReturn(testPageEditDto);
        when(pageSectionMapper.toDto(any(Page.class), anyList())).thenReturn(testPageSectionDto);
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

        // Configuration du SecurityContext pour simuler une authentification
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                testUserDetails, null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
        SecurityContextHolder.getContext().setAuthentication(auth);

        try {
            // When & Then
            mockMvc.perform(post("/api/pages")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.name").value("Test Page"));
        } finally {
            // Nettoyage du SecurityContext
            SecurityContextHolder.clearContext();
        }
    }

    @Test
    @DisplayName("PUT /api/pages/{pageId} - Doit mettre à jour une page")
    void shouldUpdatePage() throws Exception {
        // Given
        UUID pageId = UUID.randomUUID();
        PageRequest request = new PageRequest(pageId, null, "Updated Page", "Updated Title", "Updated Subtitle", "updated-page", "Updated Description", true);
        when(pageService.updatePage(eq(pageId), eq("Updated Page"), eq("Updated Title"), eq("Updated Subtitle"), eq("updated-page"), eq("Updated Description"), eq(true), any(User.class)))
                .thenReturn(testPage);

        // Configuration du SecurityContext pour simuler une authentification
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                testUserDetails, null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
        SecurityContextHolder.getContext().setAuthentication(auth);

        try {
            // When & Then
            mockMvc.perform(put("/api/pages/{pageId}", pageId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.name").value("Test Page"));
        } finally {
            // Nettoyage du SecurityContext
            SecurityContextHolder.clearContext();
        }
    }

    @Test
    @DisplayName("DELETE /api/pages/{pageId} - Doit supprimer une page")
    void shouldDeletePage() throws Exception {
        // Given
        UUID pageId = UUID.randomUUID();

        // Configuration du SecurityContext pour simuler une authentification (maintenant requis)
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                testUserDetails, null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
        SecurityContextHolder.getContext().setAuthentication(auth);

        try {
            // When & Then
            mockMvc.perform(delete("/api/pages/{pageId}", pageId))
                    .andExpect(status().isNoContent());
        } finally {
            // Nettoyage du SecurityContext
            SecurityContextHolder.clearContext();
        }
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
                .role("ROLE_USER")
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
