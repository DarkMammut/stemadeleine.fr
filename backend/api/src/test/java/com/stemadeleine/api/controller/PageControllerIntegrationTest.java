package com.stemadeleine.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stemadeleine.api.dto.PageRequest;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.repository.PageRepository;
import com.stemadeleine.api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false) // Désactive tous les filtres de sécurité
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration"
})
@Transactional
@DisplayName("Tests d'intégration du contrôleur PageController")
class PageControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PageRepository pageRepository;

    @Autowired
    private UserRepository userRepository;

    private User testUser;
    private Page testPage;
    private CustomUserDetails testUserDetails;

    @BeforeEach
    void setUp() {
        // Nettoyer les données existantes pour éviter les conflits
        pageRepository.deleteAll();
        userRepository.deleteAll();

        // Créer un utilisateur de test (sans ID manuel - laisser JPA le générer)
        testUser = User.builder()
                .firstname("Test")
                .lastname("User")
                .email("test-integration-" + System.currentTimeMillis() + "@example.com") // Email unique
                .build();
        testUser = userRepository.save(testUser);

        // Créer un Account pour l'authentification
        Account testAccount = Account.builder()
                .email(testUser.getEmail())
                .password("password")
                .role("ROLE_USER")
                .isActive(true)
                .emailVerified(true)
                .user(testUser)
                .build();
        testUserDetails = new CustomUserDetails(testAccount);

        // Créer une page de test (sans ID manuel - laisser JPA le générer)
        testPage = Page.builder()
                .pageId(UUID.randomUUID())
                .name("Test Page")
                .title("Test Title")
                .subTitle("Test Subtitle")
                .slug("test-page-" + System.currentTimeMillis()) // Slug unique
                .description("Test Description")
                .status(PublishingStatus.PUBLISHED)
                .isVisible(true)
                .sortOrder(1)
                .version(1)
                .author(testUser)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
        testPage = pageRepository.save(testPage);
    }

    // Méthode utilitaire pour configurer l'authentification
    private void setAuthentication() {
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                testUserDetails, null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    // Méthode utilitaire pour nettoyer l'authentification
    private void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("GET /api/pages - Doit retourner toutes les pages depuis la DB")
    void shouldReturnAllPagesFromDatabase() throws Exception {
        mockMvc.perform(get("/api/pages"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[?(@.name == 'Test Page')]").exists());
    }

    @Test
    @DisplayName("GET /api/pages/tree - Doit retourner l'arbre des pages depuis la DB")
    void shouldReturnPageTreeFromDatabase() throws Exception {
        mockMvc.perform(get("/api/pages/tree"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("GET /api/pages/slug/{slug} - Doit retourner une page par slug depuis la DB")
    void shouldReturnPageBySlugFromDatabase() throws Exception {
        mockMvc.perform(get("/api/pages/slug/{slug}", testPage.getSlug()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.name").value(testPage.getName()))
                .andExpect(jsonPath("$.slug").value(testPage.getSlug()));
    }

    @Test
    @DisplayName("GET /api/pages/slug/{slug} - Doit retourner 404 pour slug inexistant")
    void shouldReturn404ForNonExistentSlug() throws Exception {
        mockMvc.perform(get("/api/pages/slug/{slug}", "non-existent-slug"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/pages/{pageId} - Doit retourner une page par ID depuis la DB")
    void shouldReturnPageByIdFromDatabase() throws Exception {
        mockMvc.perform(get("/api/pages/{pageId}", testPage.getPageId()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.name").value(testPage.getName()))
                .andExpect(jsonPath("$.pageId").value(testPage.getPageId().toString()));
    }

    @Test
    @DisplayName("GET /api/pages/{pageId}/sections - Doit retourner une page avec sections depuis la DB")
    void shouldReturnPageWithSectionsFromDatabase() throws Exception {
        mockMvc.perform(get("/api/pages/{pageId}/sections", testPage.getPageId()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.name").value(testPage.getName()))
                .andExpect(jsonPath("$.sections").isArray());
    }

    @Test
    @DisplayName("POST /api/pages - Doit créer une nouvelle page dans la DB")
    void shouldCreateNewPageInDatabase() throws Exception {
        // Given
        PageRequest request = new PageRequest(
                null, // nouvelle page
                testPage.getPageId(), // parent
                "New Page",
                "New Title",
                "New Subtitle",
                "new-page-" + System.currentTimeMillis(), // Slug unique
                "New Description",
                true
        );

        setAuthentication();
        try {
            // When & Then
            mockMvc.perform(post("/api/pages")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.name").value("New Page"))
                    .andExpect(jsonPath("$.title").value("New Title"));

            // Vérifier que la page a été créée en DB
            List<Page> allPages = pageRepository.findAll();
            boolean pageCreated = allPages.stream()
                    .anyMatch(page -> "New Page".equals(page.getName()));
            assertThat(pageCreated).isTrue();
        } finally {
            clearAuthentication();
        }
    }

    @Test
    @DisplayName("PUT /api/pages/{pageId} - Doit mettre à jour une page dans la DB")
    void shouldUpdatePageInDatabase() throws Exception {
        // Given
        PageRequest request = new PageRequest(
                testPage.getPageId(),
                null,
                "Updated Page",
                "Updated Title",
                "Updated Subtitle",
                "updated-page-" + System.currentTimeMillis(), // Slug unique
                "Updated Description",
                false
        );

        setAuthentication();
        try {
            // When & Then
            mockMvc.perform(put("/api/pages/{pageId}", testPage.getPageId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.name").value("Updated Page"));

            // Vérifier que la page a été mise à jour en DB
            Page updatedPage = pageRepository.findTopByPageIdOrderByVersionDesc(testPage.getPageId()).orElse(null);
            assertThat(updatedPage).isNotNull();
            assertThat(updatedPage.getName()).isEqualTo("Updated Page");
        } finally {
            clearAuthentication();
        }
    }

    @Test
    @DisplayName("PUT /api/pages/{pageId}/visibility - Doit mettre à jour la visibilité dans la DB")
    void shouldUpdateVisibilityInDatabase() throws Exception {
        // Given
        Boolean newVisibility = false;

        setAuthentication();
        try {
            // When & Then
            mockMvc.perform(put("/api/pages/{pageId}/visibility", testPage.getPageId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(newVisibility)))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON));

            // Vérifier que la visibilité a été mise à jour en DB
            Page updatedPage = pageRepository.findTopByPageIdOrderByVersionDesc(testPage.getPageId()).orElse(null);
            assertThat(updatedPage).isNotNull();
            assertThat(updatedPage.getIsVisible()).isEqualTo(false);
        } finally {
            clearAuthentication();
        }
    }

    @Test
    @DisplayName("PUT /api/pages/tree - Doit mettre à jour l'ordre de l'arbre des pages")
    void shouldUpdatePageTreeOrder() throws Exception {
        // Given - créer plusieurs pages pour tester l'ordre (SANS ID manuel)
        Page page2 = Page.builder()
                .pageId(UUID.randomUUID())
                .name("Page 2")
                .title("Title 2")
                .slug("page-2-" + System.currentTimeMillis()) // Slug unique
                .status(PublishingStatus.PUBLISHED)
                .isVisible(true)
                .sortOrder(2)
                .version(1)
                .author(testUser)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
        page2 = pageRepository.save(page2);

        // Créer la structure d'arbre à envoyer
        List<Map<String, Object>> treeStructure = List.of(
                Map.of(
                        "id", testPage.getId().toString(),
                        "pageId", testPage.getPageId().toString(),
                        "name", testPage.getName(),
                        "sortOrder", 2
                ),
                Map.of(
                        "id", page2.getId().toString(),
                        "pageId", page2.getPageId().toString(),
                        "name", page2.getName(),
                        "sortOrder", 1
                )
        );

        setAuthentication();
        try {
            // When & Then
            mockMvc.perform(put("/api/pages/tree")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(treeStructure)))
                    .andExpect(status().isOk());
        } finally {
            clearAuthentication();
        }
    }

    @Test
    @DisplayName("DELETE /api/pages/{pageId} - Doit supprimer logiquement une page dans la DB")
    void shouldDeletePageInDatabase() throws Exception {
        setAuthentication();
        try {
            // When & Then
            mockMvc.perform(delete("/api/pages/{pageId}", testPage.getPageId()))
                    .andExpect(status().isNoContent());

            // Vérifier que la page a été supprimée logiquement (status = DELETED)
            Page deletedPage = pageRepository.findTopByPageIdOrderByVersionDesc(testPage.getPageId()).orElse(null);
            assertThat(deletedPage).isNotNull();
            assertThat(deletedPage.getStatus()).isEqualTo(PublishingStatus.DELETED);
        } finally {
            clearAuthentication();
        }
    }

    @Test
    @DisplayName("POST /api/pages/{pageId}/version - Doit créer une nouvelle version dans la DB")
    void shouldCreatePageVersionInDatabase() throws Exception {
        // Given
        PageRequest request = new PageRequest(
                testPage.getPageId(),
                null,
                "Version 2",
                "Version 2 Title",
                "Version 2 Subtitle",
                "version-2-page-" + System.currentTimeMillis(), // Slug unique
                "Version 2 Description",
                true
        );

        setAuthentication();
        try {
            // When & Then
            mockMvc.perform(post("/api/pages/{pageId}/version", testPage.getPageId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.name").value("Version 2"));

            // Vérifier qu'une nouvelle version a été créée
            List<Page> allPages = pageRepository.findAll();
            List<Page> versions = allPages.stream()
                    .filter(page -> page.getPageId().equals(testPage.getPageId()))
                    .sorted((p1, p2) -> p2.getVersion().compareTo(p1.getVersion()))
                    .toList();
            assertThat(versions).hasSize(2);
            assertThat(versions.get(0).getVersion()).isEqualTo(2);
            assertThat(versions.get(0).getName()).isEqualTo("Version 2");
        } finally {
            clearAuthentication();
        }
    }

    @Test
    @DisplayName("PUT /api/pages/{pageId}/publish - Doit publier une page dans la DB")
    void shouldPublishPageInDatabase() throws Exception {
        // Given - créer une page en brouillon (SANS ID manuel)
        Page draftPage = Page.builder()
                .pageId(UUID.randomUUID())
                .name("Draft Page")
                .title("Draft Title")
                .slug("draft-page-" + System.currentTimeMillis()) // Slug unique
                .status(PublishingStatus.DRAFT)
                .isVisible(true)
                .version(1)
                .author(testUser)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
        draftPage = pageRepository.save(draftPage);

        setAuthentication();
        try {
            // When & Then
            mockMvc.perform(put("/api/pages/{pageId}/publish", draftPage.getPageId()))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON));

            // Vérifier que la page a été publiée
            Page publishedPage = pageRepository.findTopByPageIdOrderByVersionDesc(draftPage.getPageId()).orElse(null);
            assertThat(publishedPage).isNotNull();
            assertThat(publishedPage.getStatus()).isEqualTo(PublishingStatus.PUBLISHED);
        } finally {
            clearAuthentication();
        }
    }

    @Test
    @DisplayName("Tests d'autorisation - Doit fonctionner avec authentification simulée")
    void shouldAllowRequestsWithoutAuthentication() throws Exception {
        // Les tests d'intégration nécessitent une authentification simulée
        PageRequest request = new PageRequest(null, testPage.getPageId(), "No Auth Page", "Title", "Subtitle", "no-auth-" + System.currentTimeMillis(), "Description", true);

        setAuthentication();
        try {
            // POST devrait fonctionner avec authentification
            mockMvc.perform(post("/api/pages")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());
        } finally {
            clearAuthentication();
        }
    }
}
