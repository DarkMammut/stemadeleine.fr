package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateNewsletterRequest;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.repository.NewsletterRepository;
import com.stemadeleine.api.repository.ContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import com.stemadeleine.api.model.Module;

@Service
@RequiredArgsConstructor
public class NewsletterService {

    private final NewsletterRepository newsletterRepository;
    private final ModuleService moduleService;
    private final ContentRepository contentRepository;

    public List<Newsletter> getAllNewsletters() {
        return newsletterRepository.findByStatusNot(PublishingStatus.DELETED);
    }

    public Optional<Newsletter> getNewsletterById(UUID id) {
        return newsletterRepository.findById(id)
                .filter(newsletter -> newsletter.getStatus() != PublishingStatus.DELETED);
    }

    public Newsletter updateNewsletter(UUID id, Newsletter details) {
        return newsletterRepository.findById(id)
                .map(newsletter -> {
                    newsletter.setDescription(details.getDescription());
                    newsletter.setIsVisible(details.getIsVisible());
                    newsletter.setStartDate(details.getStartDate());
                    newsletter.setVariant(details.getVariant());
                    return newsletterRepository.save(newsletter);
                })
                .orElseThrow(() -> new RuntimeException("Newsletter not found"));
    }

    public void softDeleteNewsletter(UUID id) {
        newsletterRepository.findById(id).ifPresent(newsletter -> {
            newsletter.setStatus(PublishingStatus.DELETED);
            newsletterRepository.save(newsletter);
        });
    }

    public Newsletter createNewsletterWithModule(CreateNewsletterRequest request, User author) {
        // Utilisation explicite du Module du projet
        Module module = moduleService.createNewModule(
                request.sectionId(),
                request.name(),
                "NEWSLETTER",
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

        // Créer la newsletter et la lier au module
        Newsletter newsletter = Newsletter.builder()
                .variant(NewsVariants.LAST3)
                .contents(List.of(content))
                .build();
        return newsletterRepository.save(newsletter);
    }
}
