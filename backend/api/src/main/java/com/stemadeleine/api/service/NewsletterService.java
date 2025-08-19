package com.stemadeleine.api.service;

import com.stemadeleine.api.model.Newsletter;
import com.stemadeleine.api.repository.NewsletterRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class NewsletterService {

    private final NewsletterRepository newsletterRepository;

    public NewsletterService(NewsletterRepository newsletterRepository) {
        this.newsletterRepository = newsletterRepository;
    }

    public List<Newsletter> findAll() {
        return newsletterRepository.findAll();
    }

    public Optional<Newsletter> findById(UUID id) {
        return newsletterRepository.findById(id);
    }

    public List<Newsletter> findVisible() {
        return newsletterRepository.findByIsVisibleTrueOrderByDateDesc();
    }

    public Newsletter save(Newsletter newsletter) {
        return newsletterRepository.save(newsletter);
    }

    public Newsletter update(UUID id, Newsletter details) {
        return newsletterRepository.findById(id)
                .map(newsletter -> {
                    newsletter.setTitle(details.getTitle());
                    newsletter.setDescription(details.getDescription());
                    newsletter.setIsVisible(details.getIsVisible());
                    newsletter.setDate(details.getDate());
                    return newsletterRepository.save(newsletter);
                })
                .orElseThrow(() -> new RuntimeException("Newsletter not found with id " + id));
    }

    public void delete(UUID id) {
        newsletterRepository.deleteById(id);
    }
}
