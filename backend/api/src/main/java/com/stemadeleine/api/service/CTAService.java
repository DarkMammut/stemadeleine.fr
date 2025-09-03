package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateCTARequest;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.repository.CTARepository;
import com.stemadeleine.api.repository.ContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CTAService {
    private final CTARepository ctaRepository;
    private final ModuleService moduleService;
    private final ContentRepository contentRepository;

    public List<CTA> getAllCTAs() {
        return ctaRepository.findByStatusNot(PublishingStatus.DELETED.name());
    }

    public Optional<CTA> getCTAById(UUID id) {
        return ctaRepository.findById(id)
                .filter(cta -> cta.getStatus() != PublishingStatus.DELETED);
    }

    public CTA createCTAWithModule(CreateCTARequest request, User author) {
        // Créer le module de type ARTICLE
        Module module = moduleService.createNewModule(
                request.sectionId(),
                request.name(),
                "CTA",
                author
        );

        // Créer un contenu générique conforme au modèle
        Content content = Content.builder()
                .ownerId(module.getId())
                .version(1)
                .status(PublishingStatus.DRAFT)
                .isVisible(false)
                .title(request.name())
                .body("")
                .build();
        contentRepository.save(content);

        // Créer le CTA et le lier au module
        CTA cta = CTA.builder()
                .label(request.name())
                .url("https://example.com")
                .variant(CtaVariants.BUTTON)
                .build();
        return ctaRepository.save(cta);
    }

    public CTA updateCTA(UUID id, CTA details) {
        return ctaRepository.findById(id)
                .map(cta -> {
                    cta.setLabel(details.getLabel());
                    cta.setUrl(details.getUrl());
                    cta.setVariant(details.getVariant());
                    cta.setIsVisible(details.getIsVisible());
                    cta.setName(details.getName());
                    return ctaRepository.save(cta);
                })
                .orElseThrow(() -> new RuntimeException("CTA not found"));
    }

    public void softDeleteCTA(UUID id) {
        ctaRepository.findById(id).ifPresent(cta -> {
            cta.setStatus(PublishingStatus.DELETED);
            ctaRepository.save(cta);
        });
    }
}
