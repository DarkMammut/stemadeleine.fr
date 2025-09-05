package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateNewsletterRequest;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.repository.ContentRepository;
import com.stemadeleine.api.repository.NewsletterRepository;
import com.stemadeleine.api.utils.JsonUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsletterService {
    private final NewsletterRepository newsletterRepository;
    private final ModuleService moduleService;
    private final ContentRepository contentRepository;

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
                    newsletter.setStartDate(details.getStartDate());
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

    public Newsletter createNewsletterWithModule(CreateNewsletterRequest request, User author) {
        log.info("Création d'une nouvelle newsletter pour la section : {}", request.sectionId());

        Module module = moduleService.createNewModule(
                request.sectionId(),
                request.name(),
                "NEWSLETTER",
                author
        );
        log.debug("Module créé avec l'ID : {}", module.getId());

        Content content = Content.builder()
                .ownerId(module.getId())
                .version(1)
                .status(PublishingStatus.DRAFT)
                .isVisible(false)
                .title(request.name())
                .body(JsonUtils.createEmptyJsonNode())
                .build();
        Content savedContent = contentRepository.save(content);
        log.debug("Contenu créé avec l'ID : {}", savedContent.getId());

        Newsletter newsletter = Newsletter.builder()
                .variant(NewsVariants.LAST3)
                .contents(List.of(savedContent))
                .moduleId(module.getModuleId())
                .section(module.getSection())
                .name(module.getName())
                .title(module.getTitle())
                .type(module.getType())
                .sortOrder(module.getSortOrder())
                .isVisible(module.getIsVisible())
                .status(module.getStatus())
                .author(author)
                .version(1)
                .startDate(OffsetDateTime.now())
                .description("Nouvelle newsletter")
                .build();

        Newsletter savedNewsletter = newsletterRepository.save(newsletter);
        log.info("Newsletter créée avec succès, ID : {}", savedNewsletter.getId());
        return savedNewsletter;
    }
}
