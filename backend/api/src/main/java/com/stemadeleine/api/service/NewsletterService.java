package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateModuleRequest;
import com.stemadeleine.api.dto.UpdateNewsRequest;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.repository.NewsletterRepository;
import com.stemadeleine.api.repository.SectionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

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

    @Transactional
    public Newsletter updateNewsletter(UUID id, Newsletter details) {
        log.info("Mise à jour de la newsletter avec l'ID : {}", id);
        return newsletterRepository.findById(id)
                .map(newsletter -> {
                    newsletter.setDescription(details.getDescription());
                    newsletter.setIsVisible(details.getIsVisible());
                    newsletter.setVariant(details.getVariant());
                    newsletter.setMedia(details.getMedia());
                    newsletter.setContents(details.getContents());
                    newsletter.setName(details.getName());
                    newsletter.setTitle(details.getTitle());
                    newsletter.setSortOrder(details.getSortOrder());
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

        // Créer directement la timeline (hérite de Module)
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

    public com.stemadeleine.api.model.Newsletter createNewsletterVersion(UpdateNewsRequest request, User author) {
        log.info("Création d'une nouvelle version d'article pour le moduleId : {}", request.moduleId());

        // 1. Récupérer le module
        Module module = moduleService.getModuleByModuleId(request.moduleId())
                .orElseThrow(() -> new RuntimeException("Module not found for id: " + request.moduleId()));

        // 2. Récupérer la dernière version de l'article pour ce module
        com.stemadeleine.api.model.Newsletter previousNewsletter = newsletterRepository.findTopByModuleIdOrderByVersionDesc(request.moduleId())
                .orElse(null);

        // 3. Fusionner les infos du request et de la version précédente
        String name = request.name() != null ? request.name() : (previousNewsletter != null ? previousNewsletter.getName() : module.getName());
        String title = request.title() != null ? request.title() : (previousNewsletter != null ? previousNewsletter.getTitle() : module.getTitle());
        NewsVariants variant = request.variant() != null ? request.variant() : (previousNewsletter != null ? previousNewsletter.getVariant() : NewsVariants.LAST3);
        String type = module.getType();
        Integer sortOrder = module.getSortOrder();
        Boolean isVisible = module.getIsVisible();
        PublishingStatus status = PublishingStatus.DRAFT;
        int newVersion = previousNewsletter != null ? previousNewsletter.getVersion() + 1 : 1;

        com.stemadeleine.api.model.Newsletter newsletter = com.stemadeleine.api.model.Newsletter.builder()
                .variant(variant)
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

        com.stemadeleine.api.model.Newsletter savedNewsletter = newsletterRepository.save(newsletter);
        log.info("Nouvelle version de newsletter créée avec succès, ID : {}", savedNewsletter.getId());
        return savedNewsletter;
    }
}
