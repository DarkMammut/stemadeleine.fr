package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateModuleRequest;
import com.stemadeleine.api.dto.UpdateNewsletterPutRequest;
import com.stemadeleine.api.dto.UpdateNewsletterRequest;
import com.stemadeleine.api.model.NewsVariants;
import com.stemadeleine.api.model.Newsletter;
import com.stemadeleine.api.model.Page;
import com.stemadeleine.api.model.PublishingStatus;
import com.stemadeleine.api.model.Section;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.NewsletterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsletterService {

    private static final String DETAIL_PAGE_URL = "/newsletters";

    private final NewsletterRepository newsletterRepository;
    private final ModuleService moduleService;
    private final PageService pageService;
    private final SectionService sectionService;

    public List<Newsletter> getAllNewsletters() {
        return newsletterRepository.findByStatus(PublishingStatus.DRAFT);
    }

    public Optional<Newsletter> getNewsletterById(UUID id) {
        return newsletterRepository.findById(id)
                .filter(n -> n.getStatus() == PublishingStatus.DRAFT || n.getStatus() == PublishingStatus.PUBLISHED);
    }

    /**
     * DRAFT of a newsletter module (backoffice).
     */
    public Optional<Newsletter> getLastVersionByModuleId(UUID moduleId) {
        return newsletterRepository.findByModuleIdAndStatus(moduleId, PublishingStatus.DRAFT);
    }

    /**
     * PUBLISHED version of a newsletter module (public site).
     */
    public Optional<Newsletter> getPublishedByModuleId(UUID moduleId) {
        return newsletterRepository.findByModuleIdAndStatus(moduleId, PublishingStatus.PUBLISHED);
    }

    public boolean existsNewsletterWithVariantAll() {
        return newsletterRepository.existsByVariantAndStatus(NewsVariants.ALL, PublishingStatus.DRAFT);
    }

    @Transactional
    public Newsletter updateNewsletter(UUID id, UpdateNewsletterPutRequest request) {
        Newsletter newsletter = moduleService.findDraftByRowId(newsletterRepository, id)
                .orElseThrow(() -> new RuntimeException("Newsletter not found"));

        if (request.getTitle() != null) newsletter.setTitle(request.getTitle());
        if (request.getName() != null) newsletter.setName(request.getName());
        if (request.getSortOrder() != null) newsletter.setSortOrder(request.getSortOrder());
        if (request.getVariant() != null) newsletter.setVariant(request.getVariant());

        return moduleService.saveDraft(newsletter);
    }

    @Transactional
    public void softDeleteNewsletter(UUID id) {
        moduleService.softDeleteModuleByRowId(id);
    }

    @Transactional
    public Newsletter createNewsletterWithModule(CreateModuleRequest request, User author) {
        Section section = moduleService.getDraftSection(request.sectionId());

        Newsletter newsletter = Newsletter.builder()
                .moduleId(UUID.randomUUID())
                .variant(NewsVariants.LAST3)
                .contents(new ArrayList<>())
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

        return newsletterRepository.save(newsletter);
    }

    /**
     * Updates the DRAFT of the newsletter module in place (no new row).
     */
    @Transactional
    public Newsletter createNewsletterVersion(UpdateNewsletterRequest request, User author) {
        Newsletter newsletter = newsletterRepository.findByModuleIdAndStatus(request.moduleId(), PublishingStatus.DRAFT)
                .orElseThrow(() -> new RuntimeException("Draft newsletter not found for moduleId: " + request.moduleId()));

        if (request.name() != null) newsletter.setName(request.name());
        if (request.title() != null) newsletter.setTitle(request.title());
        if (request.variant() != null) newsletter.setVariant(request.variant());
        newsletter.setAuthor(author);

        return moduleService.saveDraft(newsletter);
    }

    /**
     * Creates and publishes the pages structure of the newsletters: /newsletters, its section,
     * the dynamic detail page and the "all newsletters" module.
     */
    @Transactional
    public Map<String, UUID> createNewsletterPagesStructure(User author) {
        log.info("Création de la structure complète pour les pages Newsletter avec URL fixe /newsletters");

        Page newslettersPage = pageService.createNewPage(null, "Newsletters", author);
        newslettersPage = pageService.updatePage(
                newslettersPage.getPageId(), "Newsletters", "Newsletters", null, "/newsletters", null, true, author);

        Section section = sectionService.createNewSection(newslettersPage.getPageId(), "Section Newsletters", author);
        section = sectionService.updateSection(
                section.getSectionId(), "Section Newsletters", "Section Newsletters", true, author);

        // Dynamic detail page [newsletterId], not visible in the navigation
        Page detailPage = pageService.createNewPage(newslettersPage.getPageId(), "[newsletterId]", author);
        detailPage = pageService.updatePage(
                detailPage.getPageId(), "[newsletterId]", "[newsletterId]", null, "/[newsletterId]", null, false, author);

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
                .status(PublishingStatus.DRAFT)
                .author(author)
                .version(1)
                .description("Module pour afficher toutes les newsletters")
                .detailPageUrl(DETAIL_PAGE_URL)
                .build();
        Newsletter savedNewsletter = newsletterRepository.save(newsletter);

        // The module is published together with its section (the page must be published first)
        pageService.publishPage(newslettersPage.getPageId(), author);
        sectionService.publishSection(section.getSectionId(), author);

        // All the other newsletter modules (DRAFT and PUBLISHED rows) share the same detail page
        for (PublishingStatus status : List.of(PublishingStatus.DRAFT, PublishingStatus.PUBLISHED)) {
            for (Newsletter existing : newsletterRepository.findByStatus(status)) {
                if (!existing.getModuleId().equals(savedNewsletter.getModuleId())) {
                    existing.setDetailPageUrl(DETAIL_PAGE_URL);
                    newsletterRepository.save(existing);
                }
            }
        }

        Map<String, UUID> result = new HashMap<>();
        result.put("newslettersPageId", newslettersPage.getPageId());
        result.put("detailPageId", detailPage.getPageId());
        result.put("sectionId", section.getSectionId());
        result.put("newsletterModuleId", savedNewsletter.getModuleId());
        return result;
    }
}
