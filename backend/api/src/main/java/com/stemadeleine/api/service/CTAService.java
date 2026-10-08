package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateModuleRequest;
import com.stemadeleine.api.dto.UpdateCTARequest;
import com.stemadeleine.api.model.CTA;
import com.stemadeleine.api.model.CtaVariants;
import com.stemadeleine.api.model.PublishingStatus;
import com.stemadeleine.api.model.Section;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.CTARepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CTAService {
    private final CTARepository ctaRepository;
    private final ModuleService moduleService;

    public List<CTA> getAllCTAs() {
        return ctaRepository.findByStatus(PublishingStatus.DRAFT);
    }

    public Optional<CTA> getCTAById(UUID id) {
        return ctaRepository.findById(id)
                .filter(c -> c.getStatus() == PublishingStatus.DRAFT || c.getStatus() == PublishingStatus.PUBLISHED);
    }

    @Transactional
    public CTA createCTAWithModule(CreateModuleRequest request, User author) {
        Section section = moduleService.getDraftSection(request.sectionId());

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

        return ctaRepository.save(cta);
    }

    /**
     * DRAFT of a CTA (backoffice).
     */
    public Optional<CTA> getCTAByModuleId(UUID moduleId) {
        return ctaRepository.findByModuleIdAndStatus(moduleId, PublishingStatus.DRAFT);
    }

    /**
     * PUBLISHED version of a CTA (public site).
     */
    public Optional<CTA> getPublishedByModuleId(UUID moduleId) {
        return ctaRepository.findByModuleIdAndStatus(moduleId, PublishingStatus.PUBLISHED);
    }

    @Transactional
    public CTA updateCTA(UUID id, UpdateCTARequest request, User user) {
        CTA cta = moduleService.findDraftByRowId(ctaRepository, id)
                .orElseThrow(() -> new RuntimeException("CTA not found"));
        applyRequest(cta, request);
        cta.setAuthor(user);
        return moduleService.saveDraft(cta);
    }

    /**
     * Updates the DRAFT of the CTA in place (no new row).
     */
    @Transactional
    public CTA createCTAVersion(UpdateCTARequest request, User author) {
        CTA cta = getCTAByModuleId(request.moduleId())
                .orElseThrow(() -> new RuntimeException("Draft CTA not found for moduleId: " + request.moduleId()));
        applyRequest(cta, request);
        cta.setAuthor(author);
        return moduleService.saveDraft(cta);
    }

    @Transactional
    public void softDeleteCTA(UUID id) {
        moduleService.softDeleteModuleByRowId(id);
    }

    private void applyRequest(CTA cta, UpdateCTARequest request) {
        if (request.name() != null) cta.setName(request.name());
        if (request.title() != null) cta.setTitle(request.title());
        if (request.label() != null) cta.setLabel(request.label());
        if (request.url() != null) cta.setUrl(request.url());
        if (request.variant() != null) cta.setVariant(request.variant());
    }
}
