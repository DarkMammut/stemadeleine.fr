package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateModuleRequest;
import com.stemadeleine.api.dto.UpdateNewsletterPutRequest;
import com.stemadeleine.api.dto.UpdateNewsletterRequest;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.repository.NewsletterRepository;
import com.stemadeleine.api.repository.SectionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsletterService {
    private final NewsletterRepository newsletterRepository;
    private final ModuleService moduleService;
    private final SectionRepository sectionRepository;
    private final PageService pageService;
    private final SectionService sectionService;

    /**
     * Retourne l'URL de base pour les détails des newsletters.
     * Toujours fixée à /newsletters pour simplifier la gestion.
     *
     * @return L'URL de base pour les détails des newsletters : /newsletters
     */
    private String getNewsletterDetailPageUrl() {
        log.debug("URL de détail des newsletters : /newsletters");
        return "/newsletters";
    }

    public List<Newsletter> getAllNewsletters() {
        log.info("Récupération de toutes les newsletters non supprimées");
        List<Newsletter> newsletters = newsletterRepository.findByStatusNot(PublishingStatus.DELETED);
        log.debug("Nombre de newsletters trouvées : {}", newsletters.size());
        return newsletters;
    }

    public Optional<Newsletter> getNewsletterById(UUID id) {
        log.info("Recherche de la newsletter avec l'ID : {}", id);
        Optional<Newsletter> newsletter = newsletterRepository.findById(id)
                .filter(n -> n.getStatus() != PublishingStatus.DELETED);
        log.debug("Newsletter trouvée : {}", newsletter.isPresent());
        return newsletter;
    }

    public Optional<Newsletter> getLastVersionByModuleId(UUID moduleId) {
        log.info("Recherche de la dernière version de la newsletter avec le moduleId : {}", moduleId);
        Optional<Newsletter> newsletter = newsletterRepository.findTopByModuleIdOrderByVersionDesc(moduleId)
                .filter(n -> n.getStatus() != PublishingStatus.DELETED);
        log.debug("Newsletter trouvée : {}", newsletter.isPresent());
        return newsletter;
    }

    public boolean existsNewsletterWithVariantAll() {
        log.info("Vérification de l'existence d'une newsletter avec la variante ALL");
        boolean exists = newsletterRepository.existsByVariantAndStatusNot(NewsVariants.ALL, PublishingStatus.DELETED);
        log.debug("Newsletter avec variante ALL existe : {}", exists);
        return exists;
    }

    @Transactional
    public Newsletter updateNewsletter(UUID id, UpdateNewsletterPutRequest request) {
        log.info("Mise à jour de la newsletter avec l'ID : {}", id);
        return newsletterRepository.findById(id)
                .map(newsletter -> {
                    if (request.getTitle() != null) {
                        newsletter.setTitle(request.getTitle());
                    }
                    if (request.getName() != null) {
                        newsletter.setName(request.getName());
                    }
                    if (request.getSortOrder() != null) {
                        newsletter.setSortOrder(request.getSortOrder());
                    }
                    if (request.getVariant() != null) {
                        newsletter.setVariant(request.getVariant());
                    }
                    log.debug("Newsletter mise à jour : {}", newsletter);
                    return newsletterRepository.save(newsletter);
                })
                .orElseThrow(() -> {
                    log.error("Newsletter non trouvée avec l'ID : {}", id);
                    return new RuntimeException("Newsletter not found");
                });
    }

    public void softDeleteNewsletter(UUID id) {
        log.info("Suppression logique de la newsletter avec l'ID : {}", id);
        newsletterRepository.findById(id).ifPresent(newsletter -> {
            newsletter.setStatus(PublishingStatus.DELETED);
            newsletterRepository.save(newsletter);
            log.debug("Newsletter marquée comme supprimée : {}", id);
        });
    }

    public Newsletter createNewsletterWithModule(CreateModuleRequest request, User author) {
        log.info("Création d'une nouvelle newsletter pour la section : {}", request.sectionId());

        // Récupérer la section à partir de l'UUID
        Section section = sectionRepository.findTopBySectionIdOrderByVersionDesc(request.sectionId())
                .orElseThrow(() -> new RuntimeException("Section not found for id: " + request.sectionId()));

        // Créer directement la newsletter (hérite de Module)
        Newsletter newsletter = Newsletter.builder()
                .moduleId(UUID.randomUUID())
                .variant(NewsVariants.LAST3)
                .contents(new java.util.ArrayList<>())
                .section(section)
                .name(request.name())
                .title(request.name())
                .type("NEWSLETTER")
                .sortOrder(0)
                .isVisible(false)
                .status(PublishingStatus.DRAFT)
                .author(author)
                .version(1)
                .description("Newsletter description")
                .build();

        Newsletter savedNewsletter = newsletterRepository.save(newsletter);
        log.info("Newsletter créée avec succès, ID : {}", savedNewsletter.getId());
        return savedNewsletter;
    }

    public Newsletter createNewsletterVersion(UpdateNewsletterRequest request, User author) {
        log.info("Création d'une nouvelle version de newsletter pour le moduleId : {}", request.moduleId());

        // 1. Récupérer le module
        Module module = moduleService.getModuleByModuleId(request.moduleId())
                .orElseThrow(() -> new RuntimeException("Module not found for id: " + request.moduleId()));

        // 2. Récupérer la dernière version de la newsletter pour ce module
        Newsletter previousNewsletter = newsletterRepository.findTopByModuleIdOrderByVersionDesc(request.moduleId())
                .orElse(null);

        // 3. Fusionner les infos du request et de la version précédente
        String name = request.name() != null ? request.name() : (previousNewsletter != null ? previousNewsletter.getName() : module.getName());
        String title = request.title() != null ? request.title() : (previousNewsletter != null ? previousNewsletter.getTitle() : module.getTitle());
        NewsVariants variant = request.variant() != null ? request.variant() : (previousNewsletter != null ? previousNewsletter.getVariant() : NewsVariants.LAST3);
        List<Content> contents = previousNewsletter != null ? new ArrayList<>(previousNewsletter.getContents()) : new ArrayList<>();
        String type = module.getType();
        Integer sortOrder = module.getSortOrder();
        Boolean isVisible = module.getIsVisible();
        PublishingStatus status = PublishingStatus.DRAFT;
        int newVersion = previousNewsletter != null ? previousNewsletter.getVersion() + 1 : 1;

        Newsletter newsletter = Newsletter.builder()
                .variant(variant)
                .contents(contents)
                .moduleId(module.getModuleId())
                .section(module.getSection())
                .name(name)
                .title(title)
                .type(type)
                .sortOrder(sortOrder)
                .isVisible(isVisible)
                .status(status)
                .author(author)
                .version(newVersion)
                .build();

        Newsletter savedNewsletter = newsletterRepository.save(newsletter);
        log.info("Nouvelle version de newsletter créée avec succès, ID : {}", savedNewsletter.getId());
        return savedNewsletter;
    }

    @Transactional
    public Map<String, UUID> createNewsletterPagesStructure(User author) {
        log.info("Création de la structure complète pour les pages Newsletter avec URL fixe /newsletters");

        // 1. Créer la page "Newsletters" à la racine (parentPageId = null)
        Page newslettersPage = pageService.createNewPage(null, "Newsletters", author);

        // Mettre à jour le slug et publier la page
        newslettersPage.setSlug("/newsletters");
        newslettersPage.setIsVisible(false);
        newslettersPage.setStatus(PublishingStatus.PUBLISHED);
        newslettersPage = pageService.updatePage(
                newslettersPage.getPageId(),
                "Newsletters",
                "Newsletters",
                null,
                "/newsletters",
                null,
                true,
                author
        );
        log.debug("Page Newsletters créée et publiée avec l'ID : {}", newslettersPage.getPageId());

        // 2. Créer une section dans cette page
        Section section = sectionService.createNewSection(newslettersPage.getPageId(), "Section Newsletters", author);
        section.setIsVisible(true);
        section.setStatus(PublishingStatus.PUBLISHED);
        section = sectionService.updateSection(section.getSectionId(), "Section Newsletters", "Section Newsletters", true, author);
        log.debug("Section créée et publiée avec l'ID : {}", section.getSectionId());

        // 3. Créer la page enfant dynamique [newsletterId]
        Page detailPage = pageService.createNewPage(newslettersPage.getPageId(), "[newsletterId]", author);

        // Mettre à jour le slug et publier la page (INVISIBLE pour ne pas apparaître dans la navigation)
        detailPage.setSlug("/[newsletterId]");
        detailPage.setIsVisible(false); // Invisible car c'est une route dynamique
        detailPage.setStatus(PublishingStatus.PUBLISHED);
        detailPage = pageService.updatePage(
                detailPage.getPageId(),
                "[newsletterId]",
                "[newsletterId]",
                null,
                "/[newsletterId]",
                null,
                false, // Invisible dans la navigation
                author
        );
        log.debug("Page détail créée et publiée (invisible) avec l'ID : {}", detailPage.getPageId());

        // 4. URL de détail toujours fixée à /newsletters
        String detailPageUrl = getNewsletterDetailPageUrl();
        log.debug("URL de base pour les détails : {}", detailPageUrl);

        // 5. Créer le module Newsletter avec variante ALL et l'URL de détail
        Newsletter newsletter = Newsletter.builder()
                .moduleId(UUID.randomUUID())
                .variant(NewsVariants.ALL)
                .contents(new ArrayList<>())
                .section(section)
                .name("Toutes les newsletters")
                .title("Toutes les newsletters")
                .type("NEWSLETTER")
                .sortOrder(0)
                .isVisible(true)
                .status(PublishingStatus.PUBLISHED)
                .author(author)
                .version(1)
                .description("Module pour afficher toutes les newsletters")
                .detailPageUrl(detailPageUrl)
                .build();

        Newsletter savedNewsletter = newsletterRepository.save(newsletter);
        log.debug("Module Newsletter créé et publié avec l'ID : {}, URL de détail : {}", savedNewsletter.getModuleId(), detailPageUrl);

        // 6. Mettre à jour tous les modules Newsletter existants (non supprimés) avec l'URL /newsletters
        log.info("Mise à jour de tous les modules Newsletter existants avec l'URL : {}", detailPageUrl);
        List<Newsletter> existingNewsletters = newsletterRepository.findByStatusNot(PublishingStatus.DELETED);
        int updatedCount = 0;

        for (Newsletter existingNewsletter : existingNewsletters) {
            // Ne pas mettre à jour le module qu'on vient de créer
            if (!existingNewsletter.getId().equals(savedNewsletter.getId())) {
                String previousUrl = existingNewsletter.getDetailPageUrl();
                existingNewsletter.setDetailPageUrl(detailPageUrl);
                newsletterRepository.save(existingNewsletter);
                updatedCount++;
                log.debug("Module Newsletter mis à jour : ID={}, ancienne URL={}, nouvelle URL={}",
                        existingNewsletter.getModuleId(), previousUrl, detailPageUrl);
            }
        }

        log.info("Mise à jour terminée : {} module(s) Newsletter mis à jour avec l'URL {}", updatedCount, detailPageUrl);
        log.info("Structure Newsletter créée avec succès");

        // Retourner les IDs créés
        Map<String, UUID> result = new HashMap<>();
        result.put("newslettersPageId", newslettersPage.getPageId());
        result.put("detailPageId", detailPage.getPageId());
        result.put("sectionId", section.getSectionId());
        result.put("newsletterModuleId", savedNewsletter.getModuleId());

        return result;
    }
}
