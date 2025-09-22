package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateModuleRequest;
import com.stemadeleine.api.dto.UpdateCTARequest;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.repository.CTARepository;
import com.stemadeleine.api.repository.SectionRepository;
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
    private final SectionRepository sectionRepository;

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

    public CTA createCTAWithModule(CreateModuleRequest request, User author) {
        log.info("Création d'un nouveau CTA pour la section : {}", request.sectionId());

        // Récupérer la section à partir de l'UUID
        Section section = sectionRepository.findTopBySectionIdOrderByVersionDesc(request.sectionId())
                .orElseThrow(() -> new RuntimeException("Section not found for id: " + request.sectionId()));

        // Créer directement le CTA (hérite de Module)
        CTA cta = CTA.builder()
                .moduleId(UUID.randomUUID())
                .label(request.name())
                .url("https://example.com")
                .variant(CtaVariants.BUTTON)
                .section(section)
                .name(request.name())
                .title(request.name())
                .type("CTA")
                .sortOrder(0)
                .isVisible(false)
                .status(PublishingStatus.DRAFT)
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

    public CTA createCTAVersion(UpdateCTARequest request, User author) {
        log.info("Création d'une nouvelle version de CTA pour le moduleId : {}", request.moduleId());

        // 1. Récupérer le module (pour structure ou fallback)
        Module module = moduleService.getModuleByModuleId(request.moduleId())
                .orElseThrow(() -> new RuntimeException("Module not found for id: " + request.moduleId()));

        // 2. Récupérer la dernière version du CTA pour ce module
        CTA previousCTA = ctaRepository.findTopByModuleIdOrderByVersionDesc(request.moduleId()).orElse(null);

        // 3. Fusionner les infos du request et de la version précédente
        String name = request.name() != null ? request.name() : (previousCTA != null ? previousCTA.getName() : module.getName());
        String title = request.title() != null ? request.title() : (previousCTA != null ? previousCTA.getTitle() : module.getTitle());
        String label = request.label() != null ? request.label() : (previousCTA != null ? previousCTA.getLabel() : module.getName());
        String url = request.url() != null ? request.url() : (previousCTA != null ? previousCTA.getUrl() : "");
        CtaVariants variant = request.variant() != null ? request.variant() : (previousCTA != null ? previousCTA.getVariant() : CtaVariants.BUTTON);
        String type = module.getType();
        Integer sortOrder = module.getSortOrder();
        Boolean isVisible = module.getIsVisible();
        PublishingStatus status = PublishingStatus.DRAFT;
        int newVersion = previousCTA != null ? previousCTA.getVersion() + 1 : 1;

        CTA cta = CTA.builder()
                .moduleId(module.getModuleId())
                .name(name)
                .title(title)
                .label(label)
                .url(url)
                .variant(variant)
                .author(author)
                .type(type)
                .sortOrder(sortOrder)
                .isVisible(isVisible)
                .status(status)
                .version(newVersion)
                .build();

        CTA savedCTA = ctaRepository.save(cta);
        log.info("Nouvelle version de CTA créée avec succès, ID : {}", savedCTA.getId());
        return savedCTA;
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
