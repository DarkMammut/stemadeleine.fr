package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateModuleRequest;
import com.stemadeleine.api.dto.UpdateNewsletterPutRequest;
import com.stemadeleine.api.dto.UpdateNewsletterRequest;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.repository.NewsletterRepository;
import com.stemadeleine.api.repository.SectionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsletterService {
    private final NewsletterRepository newsletterRepository;
    private final ModuleService moduleService;
    private final SectionRepository sectionRepository;

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
}
