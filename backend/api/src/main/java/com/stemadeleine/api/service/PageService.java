package com.stemadeleine.api.service;

import com.stemadeleine.api.model.Page;
import com.stemadeleine.api.repository.PageRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PageService {

    private final PageRepository pageRepository;

    public PageService(PageRepository pageRepository) {
        this.pageRepository = pageRepository;
    }

    public List<Page> findAll() {
        return pageRepository.findAll();
    }

    public Optional<Page> findById(UUID id) {
        return pageRepository.findById(id);
    }

    public Optional<Page> findBySlug(String slug) {
        return pageRepository.findBySlug(slug);
    }

    public Page save(Page page) {
        return pageRepository.save(page);
    }

    public void delete(UUID id) {
        pageRepository.deleteById(id);
    }
}
