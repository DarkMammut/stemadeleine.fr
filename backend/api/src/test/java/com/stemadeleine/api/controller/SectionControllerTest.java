package com.stemadeleine.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stemadeleine.api.dto.ContentDto;
import com.stemadeleine.api.dto.SectionDto;
import com.stemadeleine.api.dto.SectionRequest;
import com.stemadeleine.api.mapper.ContentMapper;
import com.stemadeleine.api.mapper.SectionMapper;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.service.ContentService;
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

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration"
})
@DisplayName("Tests unitaires du contrôleur SectionController")
class SectionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SectionService sectionService;

    @MockBean
    private SectionMapper sectionMapper;

    @MockBean
    private ContentService contentService;

    @MockBean
    private ContentMapper contentMapper;

    private Section testSection;
    private SectionDto testSectionDto;
    private Content testContent;
    private ContentDto testContentDto;
    private CustomUserDetails testUserDetails;
    private User testUser;
    private Account testAccount;

    @BeforeEach
    void setUp() {
        // Création des entités de test
        testUser = createTestUser();
        testAccount = createTestAccount(testUser);
        testUserDetails = new CustomUserDetails(testAccount);

        testSection = createTestSection();
        testSectionDto = createTestSectionDto();
        testContent = createTestContent();
        testContentDto = createTestContentDto();

        // Configuration du contexte de sécurité
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(testUserDetails, null,
                        List.of(new SimpleGrantedAuthority("ROLE_USER")));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Configuration des mocks par défaut pour les mappers
        when(sectionMapper.toDto(any(Section.class))).thenReturn(testSectionDto);
        when(contentMapper.toDto(any(Content.class))).thenReturn(testContentDto);
    }

    @Test
    @DisplayName("GET /api/sections - Doit retourner toutes les sections")
    void shouldReturnAllSections() throws Exception {
        // Given
        List<Section> sections = List.of(testSection);
        when(sectionService.getAllSections()).thenReturn(sections);

        // When & Then
        mockMvc.perform(get("/api/sections"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("Test Section"));
    }

    @Test
    @DisplayName("GET /api/sections/page/{pageId} - Doit retourner les sections d'une page")
    void shouldReturnSectionsByPageId() throws Exception {
        // Given
        UUID pageId = UUID.randomUUID();
        List<Section> sections = List.of(testSection);
        when(sectionService.getSectionsByPageId(pageId)).thenReturn(sections);

        // When & Then
        mockMvc.perform(get("/api/sections/page/{pageId}", pageId))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("Test Section"));
    }

    @Test
    @DisplayName("GET /api/sections/{sectionId} - Doit retourner une section par ID")
    void shouldReturnSectionById() throws Exception {
        // Given
        UUID sectionId = UUID.randomUUID();
        when(sectionService.getLastVersion(sectionId)).thenReturn(Optional.of(testSection));

        // When & Then
        mockMvc.perform(get("/api/sections/{sectionId}", sectionId))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.name").value("Test Section"));
    }

    @Test
    @DisplayName("GET /api/sections/{sectionId} - Doit retourner 404 si section non trouvée")
    void shouldReturn404WhenSectionNotFound() throws Exception {
        // Given
        UUID sectionId = UUID.randomUUID();
        when(sectionService.getLastVersion(sectionId)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/api/sections/{sectionId}", sectionId))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/sections - Doit créer une nouvelle section")
    void shouldCreateNewSection() throws Exception {
        // Given
        UUID pageId = UUID.randomUUID();
        SectionRequest request = new SectionRequest(null, pageId, "New Section", "New Section Title", true);
        when(sectionService.createNewSection(pageId, "New Section", testUser)).thenReturn(testSection);

        // When & Then
        mockMvc.perform(post("/api/sections")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .principal(new UsernamePasswordAuthenticationToken(testUserDetails, null)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(testSectionDto.id().toString()));
    }

    @Test
    @DisplayName("POST /api/sections - Doit retourner une erreur si pageId est null")
    void shouldReturnErrorWhenPageIdIsNull() throws Exception {
        // Given
        SectionRequest request = new SectionRequest(null, null, "New Section", "New Section Title", true);

        // When & Then - Le GlobalExceptionHandler convertit l'erreur "is required" en 400
        mockMvc.perform(post("/api/sections")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .principal(new UsernamePasswordAuthenticationToken(testUserDetails, null)))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("PageId is required for new section"));
    }

    @Test
    @DisplayName("PUT /api/sections/{sectionId} - Doit mettre à jour une section")
    void shouldUpdateSection() throws Exception {
        // Given
        UUID sectionId = testSection.getSectionId();
        SectionRequest request = new SectionRequest(sectionId, null, "Updated Section", "Updated Title", false);
        when(sectionService.updateSection(sectionId, "Updated Section", "Updated Title", false, testUser))
                .thenReturn(testSection);

        // When & Then
        mockMvc.perform(put("/api/sections/{sectionId}", sectionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .principal(new UsernamePasswordAuthenticationToken(testUserDetails, null)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(testSectionDto.id().toString()));
    }

    @Test
    @DisplayName("PUT /api/sections/{sectionId} - Doit retourner 404 si section non trouvée lors de la mise à jour")
    void shouldReturn404WhenUpdatingSectionNotFound() throws Exception {
        // Given
        UUID sectionId = UUID.randomUUID();
        SectionRequest request = new SectionRequest(sectionId, null, "Updated Section", "Updated Title", false);
        when(sectionService.updateSection(sectionId, "Updated Section", "Updated Title", false, testUser))
                .thenThrow(new RuntimeException("Section not found"));

        // When & Then
        mockMvc.perform(put("/api/sections/{sectionId}", sectionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .principal(new UsernamePasswordAuthenticationToken(testUserDetails, null)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("PUT /api/sections/{sectionId}/visibility - Doit mettre à jour la visibilité d'une section")
    void shouldUpdateSectionVisibility() throws Exception {
        // Given
        UUID sectionId = testSection.getSectionId();
        when(sectionService.updateSection(sectionId, null, null, false, testUser)).thenReturn(testSection);

        // When & Then
        mockMvc.perform(put("/api/sections/{sectionId}/visibility", sectionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"isVisible\": false}")
                        .principal(new UsernamePasswordAuthenticationToken(testUserDetails, null)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(testSectionDto.id().toString()));
    }

    @Test
    @DisplayName("POST /api/sections/{sectionId}/contents - Doit créer un nouveau contenu")
    void shouldCreateNewContent() throws Exception {
        // Given
        UUID sectionId = testSection.getSectionId();
        when(sectionService.createNewContent(sectionId, "New Content", testUser)).thenReturn(testContent);

        // When & Then
        mockMvc.perform(post("/api/sections/{sectionId}/contents", sectionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\": \"New Content\"}")
                        .principal(new UsernamePasswordAuthenticationToken(testUserDetails, null)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(testContentDto.id().toString()));
    }

    @Test
    @DisplayName("GET /api/sections/{sectionId}/contents - Doit retourner les contenus d'une section")
    void shouldReturnSectionContents() throws Exception {
        // Given
        UUID sectionId = testSection.getSectionId();
        List<Content> contents = List.of(testContent);
        when(sectionService.getContentsBySection(sectionId)).thenReturn(contents);

        // When & Then
        mockMvc.perform(get("/api/sections/{sectionId}/contents", sectionId))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // Méthodes utilitaires pour créer les objets de test
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

    private Section createTestSection() {
        return Section.builder()
                .id(UUID.randomUUID())
                .sectionId(UUID.randomUUID())
                .name("Test Section")
                .title("Test Section Title")
                .sortOrder(1)
                .isVisible(true)
                .status(PublishingStatus.PUBLISHED)
                .version(1)
                .author(testUser)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
    }

    private SectionDto createTestSectionDto() {
        return new SectionDto(
                testSection.getId(),
                testSection.getSectionId(),
                testSection.getName(),
                testSection.getTitle(),
                testSection.getSortOrder(),
                testSection.getIsVisible(),
                testSection.getStatus(),
                null, // media
                null, // modules
                null  // contents
        );
    }

    private Content createTestContent() {
        return Content.builder()
                .id(UUID.randomUUID())
                .contentId(UUID.randomUUID())
                .title("Test Content")
                .body(objectMapper.createObjectNode().put("text", "Test content body"))
                .version(1)
                .status(PublishingStatus.PUBLISHED)
                .sortOrder(1)
                .isVisible(true)
                .ownerId(testSection.getSectionId())
                .author(testUser)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
    }

    private ContentDto createTestContentDto() {
        return new ContentDto(
                testContent.getId(),
                testContent.getContentId(),
                testContent.getOwnerId(),
                testContent.getVersion(),
                testContent.getStatus(),
                testContent.getTitle(),
                testContent.getBody(),
                testContent.getSortOrder(),
                testContent.getIsVisible(),
                testContent.getAuthor().getUsername(),
                testContent.getCreatedAt(),
                testContent.getUpdatedAt(),
                null // medias
        );
    }
}
