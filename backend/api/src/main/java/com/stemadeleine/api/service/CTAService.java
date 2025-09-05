package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateCTARequest;
import com.stemadeleine.api.dto.UpdateCTARequest;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.repository.CTARepository;
import com.stemadeleine.api.repository.ContentRepository;
import com.stemadeleine.api.utils.JsonUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CTAService {
    private final CTARepository ctaRepository;
    private final ModuleService moduleService;
    private final ContentRepository contentRepository;

    public List<CTA> getAllCTAs() {
        log.info("Récupération de tous les CTAs non supprimés");
        List<CTA> ctas = ctaRepository.findByStatusNot(PublishingStatus.DELETED.name());
        log.debug("Nombre de CTAs trouvés : {}", ctas.size());
        return ctas;
    }

    public Optional<CTA> getCTAById(UUID id) {
        log.info("Recherche du CTA avec l'ID : {}", id);
        Optional<CTA> cta = ctaRepository.findById(id)
                .filter(c -> c.getStatus() != PublishingStatus.DELETED);
        log.debug("CTA trouvé : {}", cta.isPresent());
        return cta;
    }

    public CTA createCTAWithModule(CreateCTARequest request, User author) {
        log.info("Création d'un nouveau CTA pour la section : {}", request.sectionId());

        Module module = moduleService.createNewModule(
                request.sectionId(),
                request.name(),
                "CTA",
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
        contentRepository.save(content);
        log.debug("Contenu créé avec l'ID : {}", content.getId());

        CTA cta = CTA.builder()
                .label(request.name())
                .url("https://example.com")
                .variant(CtaVariants.BUTTON)
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
                .build();

        CTA savedCta = ctaRepository.save(cta);
        log.info("CTA créé avec succès, ID : {}", savedCta.getId());
        return savedCta;
    }

    public CTA updateCTA(UUID id, UpdateCTARequest request, User user) {
        log.info("Mise à jour du CTA avec l'ID : {}", id);
        return ctaRepository.findById(id)
                .map(cta -> {
                    cta.setLabel(request.label());
                    cta.setUrl(request.url());
                    cta.setVariant(request.variant());
                    cta.setName(request.name());
                    cta.setAuthor(user);
                    cta.setVersion(cta.getVersion() + 1);
                    log.debug("CTA mis à jour : {}", cta);
                    return ctaRepository.save(cta);
                })
                .orElseThrow(() -> {
                    log.error("CTA non trouvé avec l'ID : {}", id);
                    return new RuntimeException("CTA not found");
                });
    }

    public void softDeleteCTA(UUID id) {
        log.info("Suppression logique du CTA avec l'ID : {}", id);
        ctaRepository.findById(id).ifPresent(cta -> {
            cta.setStatus(PublishingStatus.DELETED);
            ctaRepository.save(cta);
            log.debug("CTA marqué comme supprimé : {}", id);
        });
    }
}
