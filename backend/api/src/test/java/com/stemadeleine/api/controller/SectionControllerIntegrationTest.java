package com.stemadeleine.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stemadeleine.api.dto.SectionRequest;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.repository.PageRepository;
import com.stemadeleine.api.repository.SectionRepository;
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
import org.springframework.test.web.servlet.MvcResult;
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

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration"
})
@Transactional
@DisplayName("Tests d'intégration du contrôleur SectionController")
class SectionControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private PageRepository pageRepository;

    @Autowired
    private UserRepository userRepository;

    private User testUser;
    private Page testPage;
    private Section testSection;
    private CustomUserDetails testUserDetails;

    @BeforeEach
    void setUp() {
        // Nettoyer les données existantes
        sectionRepository.deleteAll();
        pageRepository.deleteAll();
        userRepository.deleteAll();

        // Créer un utilisateur de test
        testUser = User.builder()
                .firstname("Test")
                .lastname("User")
                .email("test-integration-" + System.currentTimeMillis() + "@example.com")
                .build();
        testUser = userRepository.save(testUser);

        // Créer un Account pour l'authentification
        Account testAccount = Account.builder()
                .email(testUser.getEmail())
                .password("password")
                .role(Roles.ROLE_USER)
                .isActive(true)
                .emailVerified(true)
                .user(testUser)
                .build();
        testUserDetails = new CustomUserDetails(testAccount);

        // Créer une page de test
        testPage = Page.builder()
                .pageId(UUID.randomUUID())
                .name("Test Page")
                .title("Test Page Title")
                .subTitle("Test Subtitle")
                .slug("test-page-" + System.currentTimeMillis())
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

        // Créer une section de test
        testSection = Section.builder()
                .sectionId(UUID.randomUUID())
                .page(testPage)
                .name("Test Section")
                .title("Test Section Title")
                .version(1)
                .status(PublishingStatus.PUBLISHED)
                .isVisible(true)
                .sortOrder(1)
                .author(testUser)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
        testSection = sectionRepository.save(testSection);

        // Configuration du contexte de sécurité
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(testUserDetails, null,
                        List.of(new SimpleGrantedAuthority("ROLE_USER")));
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @Test
    @DisplayName("GET /api/sections - Doit retourner toutes les sections avec données réelles")
    void shouldReturnAllSectionsIntegration() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/sections"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].name").value("Test Section"))
                .andExpect(jsonPath("$[0].title").value("Test Section Title"));
    }

    @Test
    @DisplayName("GET /api/sections/page/{pageId} - Doit retourner les sections d'une page avec données réelles")
    void shouldReturnSectionsByPageIntegration() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/sections/page/{pageId}", testPage.getPageId()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Test Section"));
    }

    @Test
    @DisplayName("GET /api/sections/{sectionId} - Doit retourner une section existante")
    void shouldReturnExistingSectionIntegration() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/sections/{sectionId}", testSection.getSectionId()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.name").value("Test Section"))
                .andExpect(jsonPath("$.title").value("Test Section Title"))
                .andExpect(jsonPath("$.isVisible").value(true))
                .andExpect(jsonPath("$.status").value("PUBLISHED"));
    }

    @Test
    @DisplayName("GET /api/sections/{sectionId} - Doit retourner 404 pour une section inexistante")
    void shouldReturn404ForNonExistentSectionIntegration() throws Exception {
        // Given
        UUID nonExistentSectionId = UUID.randomUUID();

        // When & Then
        mockMvc.perform(get("/api/sections/{sectionId}", nonExistentSectionId))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/sections - Doit créer une nouvelle section avec base de données réelle")
    void shouldCreateNewSectionIntegration() throws Exception {
        // Given
        SectionRequest request = new SectionRequest(
                null, // sectionId null pour nouvelle section
                testPage.getPageId(),
                "New Integration Section",
                "New Integration Section Title", // Le titre sera ignoré, le service utilise le name
                true
        );

        // When
        MvcResult result = mockMvc.perform(post("/api/sections")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .principal(new UsernamePasswordAuthenticationToken(testUserDetails, null)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.name").value("New Integration Section"))
                .andExpect(jsonPath("$.title").value("New Integration Section")) // Le service met title = name
                .andExpect(jsonPath("$.sortOrder").exists()) // Le service calcule automatiquement
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.isVisible").value(false)) // Par défaut false
                .andReturn();

        // Then - Vérifier que la section a été créée en base
        List<Section> sectionsInDb = sectionRepository.findAll();
        assertThat(sectionsInDb).hasSize(2); // testSection + nouvelle section

        Section newSection = sectionsInDb.stream()
                .filter(s -> "New Integration Section".equals(s.getName()))
                .findFirst()
                .orElseThrow();

        assertThat(newSection.getName()).isEqualTo("New Integration Section");
        assertThat(newSection.getTitle()).isEqualTo("New Integration Section"); // title = name
        assertThat(newSection.getVersion()).isEqualTo(1);
        assertThat(newSection.getPage().getId()).isEqualTo(testPage.getId());
        assertThat(newSection.getAuthor().getId()).isEqualTo(testUser.getId());
    }

    @Test
    @DisplayName("POST /api/sections - Doit rejeter une requête sans pageId")
    void shouldRejectRequestWithoutPageIdIntegration() throws Exception {
        // Given
        SectionRequest request = new SectionRequest(
                null, // sectionId null pour nouvelle section
                null, // pageId manquant - doit causer une erreur
                "Invalid Section",
                "Invalid Section Title",
                true
        );

        // When & Then - Le GlobalExceptionHandler convertit l'erreur "is required" en 400
        mockMvc.perform(post("/api/sections")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .principal(new UsernamePasswordAuthenticationToken(testUserDetails, null)))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("PageId is required for new section"));

        // Vérifier qu'aucune section supplémentaire n'a été créée
        List<Section> sectionsInDb = sectionRepository.findAll();
        assertThat(sectionsInDb).hasSize(1); // Seulement testSection
    }

    @Test
    @DisplayName("PUT /api/sections/{sectionId} - Doit mettre à jour une section existante")
    void shouldUpdateExistingSectionIntegration() throws Exception {
        // Given
        SectionRequest updateRequest = new SectionRequest(
                testSection.getSectionId(), // sectionId présent pour mise à jour
                null, // pageId optionnel pour mise à jour
                "Updated Integration Section",
                "Updated Integration Title",
                false
        );

        // When
        mockMvc.perform(put("/api/sections/{sectionId}", testSection.getSectionId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest))
                        .principal(new UsernamePasswordAuthenticationToken(testUserDetails, null)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.name").value("Updated Integration Section"))
                .andExpect(jsonPath("$.title").value("Updated Integration Title"));

        // Then - Vérifier que la section a été mise à jour en base
        Section updatedSection = sectionRepository.findById(testSection.getId()).orElseThrow();
        assertThat(updatedSection.getName()).isEqualTo("Updated Integration Section");
        assertThat(updatedSection.getTitle()).isEqualTo("Updated Integration Title");
        assertThat(updatedSection.getIsVisible()).isFalse();
    }

    @Test
    @DisplayName("PUT /api/sections/{sectionId} - Doit retourner 404 pour une section inexistante")
    void shouldReturn404WhenUpdatingNonExistentSectionIntegration() throws Exception {
        // Given
        UUID nonExistentSectionId = UUID.randomUUID();
        SectionRequest updateRequest = new SectionRequest(
                nonExistentSectionId,
                null,
                "Non Existent Section",
                "Non Existent Title",
                true
        );

        // When & Then
        mockMvc.perform(put("/api/sections/{sectionId}", nonExistentSectionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest))
                        .principal(new UsernamePasswordAuthenticationToken(testUserDetails, null)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/sections/{sectionId}/contents - Doit retourner les contenus d'une section")
    void shouldReturnSectionContentsIntegration() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/sections/{sectionId}/contents", testSection.getSectionId()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("POST /api/sections/{sectionId}/contents - Doit rejeter la création de contenu pour une section inexistante")
    void shouldRejectContentCreationForNonExistentSectionIntegration() throws Exception {
        // Given
        UUID nonExistentSectionId = UUID.randomUUID();
        Map<String, String> contentRequest = Map.of("title", "Invalid Content");

        // When & Then
        mockMvc.perform(post("/api/sections/{sectionId}/contents", nonExistentSectionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(contentRequest))
                        .principal(new UsernamePasswordAuthenticationToken(testUserDetails, null)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Doit maintenir l'intégrité des relations entre Page et Section")
    void shouldMaintainPageSectionRelationshipIntegrity() throws Exception {
        // Given - Créer une nouvelle section via l'API
        SectionRequest request = new SectionRequest(
                null, // nouvelle section
                testPage.getPageId(),
                "Relationship Test Section",
                "Relationship Test Title",
                true
        );

        // When - Créer la section
        mockMvc.perform(post("/api/sections")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .principal(new UsernamePasswordAuthenticationToken(testUserDetails, null)))
                .andExpect(status().isOk());

        // Then - Vérifier les relations en base
        List<Section> sectionsInDb = sectionRepository.findAll();
        assertThat(sectionsInDb).hasSize(2);

        // Vérifier que toutes les sections sont liées à la bonne page
        sectionsInDb.forEach(section -> {
            assertThat(section.getPage()).isNotNull();
            assertThat(section.getPage().getId()).isEqualTo(testPage.getId());
            assertThat(section.getAuthor()).isNotNull();
            assertThat(section.getAuthor().getId()).isEqualTo(testUser.getId());
        });
    }

    @Test
    @DisplayName("PUT /api/sections/{sectionId}/visibility - Doit mettre à jour la visibilité d'une section")
    void shouldUpdateSectionVisibilityIntegration() throws Exception {
        // Given
        Map<String, Boolean> visibilityUpdate = Map.of("isVisible", false);

        // When & Then - Le contrôleur appelle updateSection avec les 3 paramètres null pour name, title
        mockMvc.perform(put("/api/sections/{sectionId}/visibility", testSection.getSectionId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(visibilityUpdate))
                        .principal(new UsernamePasswordAuthenticationToken(testUserDetails, null)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));

        // Then - Vérifier que la visibilité a été mise à jour en base
        Section updatedSection = sectionRepository.findById(testSection.getId()).orElseThrow();
        assertThat(updatedSection.getIsVisible()).isFalse();
    }

    @Test
    @DisplayName("POST /api/sections/{sectionId}/contents - Doit créer un nouveau contenu pour une section")
    void shouldCreateNewContentForSectionIntegration() throws Exception {
        // Given
        Map<String, String> contentRequest = Map.of("title", "New Integration Content");

        // When & Then
        mockMvc.perform(post("/api/sections/{sectionId}/contents", testSection.getSectionId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(contentRequest))
                        .principal(new UsernamePasswordAuthenticationToken(testUserDetails, null)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.title").value("New Integration Content"));
    }
}
