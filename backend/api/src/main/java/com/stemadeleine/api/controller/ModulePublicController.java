package com.stemadeleine.api.controller;


import com.stemadeleine.api.dto.ArticleDto;
import com.stemadeleine.api.dto.CTADto;
import com.stemadeleine.api.dto.GalleryDto;
import com.stemadeleine.api.dto.ListContentDto;
import com.stemadeleine.api.dto.ListDto;
import com.stemadeleine.api.dto.NewsDto;
import com.stemadeleine.api.dto.NewsletterDto;
import com.stemadeleine.api.dto.NewsletterPublicationDto;
import com.stemadeleine.api.dto.NewsPublicationDto;
import com.stemadeleine.api.mapper.ArticleMapper;
import com.stemadeleine.api.mapper.CTAMapper;
import com.stemadeleine.api.mapper.GalleryMapper;
import com.stemadeleine.api.mapper.ListMapper;
import com.stemadeleine.api.mapper.NewsMapper;
import com.stemadeleine.api.mapper.NewsletterMapper;
import com.stemadeleine.api.mapper.NewsletterPublicationMapper;
import com.stemadeleine.api.mapper.NewsPublicationMapper;
import com.stemadeleine.api.service.ArticleService;
import com.stemadeleine.api.service.CTAService;
import com.stemadeleine.api.service.GalleryService;
import com.stemadeleine.api.service.ListService;
import com.stemadeleine.api.service.NewsPublicationService;
import com.stemadeleine.api.service.NewsletterPublicationService;
import com.stemadeleine.api.service.NewsletterService;
import com.stemadeleine.api.service.NewsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/public/modules")
@CrossOrigin(origins = {"http://localhost:3000", "https://stemadeleine.fr"})
@RequiredArgsConstructor
public class ModulePublicController {

    private final ArticleService articleService;
    private final ArticleMapper articleMapper;
    private final CTAService ctaService;
    private final CTAMapper ctaMapper;
    private final GalleryService galleryService;
    private final GalleryMapper galleryMapper;
    private final NewsletterService newsletterService;
    private final NewsletterMapper newsletterMapper;
    private final NewsletterPublicationService newsletterPublicationService;
    private final NewsletterPublicationMapper newsletterPublicationMapper;
    private final NewsService newsService;
    private final NewsMapper newsMapper;
    private final NewsPublicationService newsPublicationService;
    private final NewsPublicationMapper newsPublicationMapper;
    private final ListService listService;
    private final ListMapper listMapper;

    @GetMapping("article/by-module-id/{moduleId}")
    public ResponseEntity<ArticleDto> getArticleByModuleId(@PathVariable UUID moduleId) {
        log.info("GET /api/public/modules/article/by-module-id/{} - Retrieving latest article version by moduleId", moduleId);
        return articleService.getLastVersionByModuleId(moduleId)
                .map(article -> {
                    log.debug("Article found: {} (version {})", article.getId(), article.getVersion());
                    return ResponseEntity.ok(articleMapper.toDto(article));
                })
                .orElseGet(() -> {
                    log.warn("Article not found with moduleId: {}", moduleId);
                    return ResponseEntity.notFound().build();
                });
    }

    @GetMapping("cta/by-module-id/{moduleId}")
    public ResponseEntity<CTADto> getCTAByModuleId(@PathVariable UUID moduleId) {
        log.info("GET /api/public/modules/cta/by-module-id/{} - Retrieving latest CTA version by moduleId", moduleId);
        return ctaService.getCTAByModuleId(moduleId)
                .map(cta -> {
                    log.debug("CTA found: {} (version {})", cta.getId(), cta.getVersion());
                    return ResponseEntity.ok(ctaMapper.toDto(cta));
                })
                .orElseGet(() -> {
                    log.warn("CTA not found with moduleId: {}", moduleId);
                    return ResponseEntity.notFound().build();
                });
    }

    @GetMapping("gallery/by-module-id/{moduleId}")
    public ResponseEntity<GalleryDto> getGalleryByModuleId(@PathVariable UUID moduleId) {
        log.info("GET /api/galleries/by-module-id/{} - Retrieving latest gallery version by moduleId", moduleId);
        return galleryService.getLastVersionByModuleId(moduleId)
                .map(gallery -> {
                    log.debug("Gallery found: {} (version {})", gallery.getId(), gallery.getVersion());
                    return ResponseEntity.ok(galleryMapper.toDto(gallery));
                })
                .orElseGet(() -> {
                    log.warn("Gallery not found with moduleId: {}", moduleId);
                    return ResponseEntity.notFound().build();
                });
    }

    @GetMapping("list/by-module-id/{moduleId}")
    public ResponseEntity<ListDto> getListByModuleId(@PathVariable UUID moduleId) {
        log.info("GET /api/public/modules/list/by-module-id/{} - Retrieving latest list version by moduleId", moduleId);
        return listService.getLastVersionByModuleId(moduleId)
                .map(list -> {
                    ListDto dto = listMapper.toDto(list);
                    // Ne renvoyer que les contenus visibles, triés par sortOrder, pour l'affichage public
                    List<ListContentDto> visibleContents = dto.contents() != null
                            ? dto.contents().stream()
                            .filter(content -> Boolean.TRUE.equals(content.isVisible()))
                            .sorted(Comparator.comparing(c -> c.sortOrder() != null ? c.sortOrder() : 0))
                            .toList()
                            : List.of();
                    ListDto publicDto = new ListDto(
                            dto.id(),
                            dto.moduleId(),
                            dto.sectionId(),
                            dto.name(),
                            dto.type(),
                            dto.variant(),
                            dto.sortOrder(),
                            dto.status(),
                            dto.isVisible(),
                            dto.version(),
                            visibleContents
                    );
                    log.debug("List found: {} (version {})", list.getId(), list.getVersion());
                    return ResponseEntity.ok(publicDto);
                })
                .orElseGet(() -> {
                    log.warn("List not found with moduleId: {}", moduleId);
                    return ResponseEntity.notFound().build();
                });
    }

    @GetMapping("newsletter/by-module-id/{moduleId}")
    public ResponseEntity<NewsletterDto> getNewsletterByModuleId(@PathVariable UUID moduleId) {
        log.info("GET /api/newsletters/by-module-id/{} - Retrieving latest newsletter version by moduleId", moduleId);
        return newsletterService.getLastVersionByModuleId(moduleId)
                .map(newsletter -> {
                    log.debug("Newsletter found: {} (version {})", newsletter.getId(), newsletter.getVersion());
                    return ResponseEntity.ok(newsletterMapper.toDto(newsletter));
                })
                .orElseGet(() -> {
                    log.warn("Newsletter not found with moduleId: {}", moduleId);
                    return ResponseEntity.notFound().build();
                });
    }

    @GetMapping("newsletter/publications")
    public ResponseEntity<List<NewsletterPublicationDto>> getNewsletterPublications() {
        log.info("GET /api/public/modules/newsletter/publications - Retrieving published newsletters");
        List<NewsletterPublicationDto> publications = newsletterPublicationService.getPublishedNewsletters()
                .stream()
                .map(newsletterPublicationMapper::toDto)
                .collect(Collectors.toList());
        log.debug("Found {} published newsletters", publications.size());
        return ResponseEntity.ok(publications);
    }

    // Expose a public endpoint to get a single published newsletter publication by its ID
    @GetMapping("newsletter/publications/{id}")
    public ResponseEntity<NewsletterPublicationDto> getNewsletterPublicationByIdPublic(@PathVariable UUID id) {
        log.info("GET /api/public/modules/newsletter/publications/{} - Retrieving published newsletter by id", id);
        return newsletterPublicationService.getNewsletterPublicationById(id)
                .map(publication -> {
                    log.debug("Newsletter publication found: {}", publication.getName());
                    return ResponseEntity.ok(newsletterPublicationMapper.toDto(publication));
                })
                .orElseGet(() -> {
                    log.warn("Newsletter publication not found with ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    // Expose a public endpoint to get the latest publication of a newsletter by its newsletterId (useful for versioning)
    @GetMapping("newsletter/publications/newsletter/{newsletterId}")
    public ResponseEntity<NewsletterPublicationDto> getNewsletterPublicationByNewsletterIdPublic(@PathVariable UUID newsletterId) {
        log.info("GET /api/public/modules/newsletter/publications/newsletter/{} - Retrieving published newsletter by newsletterId", newsletterId);
        return newsletterPublicationService.getNewsletterPublicationByNewsletterId(newsletterId)
                .map(publication -> {
                    log.debug("Newsletter publication found for newsletterId {}: {}", newsletterId, publication.getName());
                    return ResponseEntity.ok(newsletterPublicationMapper.toDto(publication));
                })
                .orElseGet(() -> {
                    log.warn("Newsletter publication not found with newsletterId: {}", newsletterId);
                    return ResponseEntity.notFound().build();
                });
    }

    // ===== NEWS PUBLIC ENDPOINTS =====

    @GetMapping("news/by-module-id/{moduleId}")
    public ResponseEntity<NewsDto> getNewsByModuleId(@PathVariable UUID moduleId) {
        log.info("GET /api/public/modules/news/by-module-id/{} - Retrieving latest news version by moduleId", moduleId);
        return newsService.getLastVersionByModuleId(moduleId)
                .map(news -> {
                    log.debug("News found: {} (version {})", news.getId(), news.getVersion());
                    return ResponseEntity.ok(newsMapper.toDto(news));
                })
                .orElseGet(() -> {
                    log.warn("News not found with moduleId: {}", moduleId);
                    return ResponseEntity.notFound().build();
                });
    }

    @GetMapping("news/publications")
    public ResponseEntity<Page<NewsPublicationDto>> getNewsPublications(Pageable pageable) {
        log.info("GET /api/public/modules/news/publications - Retrieving published news page");
        Page<NewsPublicationDto> publications = newsPublicationService.getPublishedNews(pageable)
                .map(newsPublicationMapper::toDto);
        log.debug("Found {} published news", publications.getTotalElements());
        return ResponseEntity.ok(publications);
    }

    @GetMapping("news/publications/news/{newsId}")
    public ResponseEntity<NewsPublicationDto> getNewsPublicationByNewsIdPublic(@PathVariable UUID newsId) {
        log.info("GET /api/public/modules/news/publications/news/{} - Retrieving published news by newsId", newsId);
        return newsPublicationService.getNewsPublicationByNewsId(newsId)
                .filter(p -> p.getStatus() != com.stemadeleine.api.model.PublishingStatus.DELETED)
                .map(publication -> {
                    log.debug("News publication found for newsId {}: {}", newsId, publication.getName());
                    return ResponseEntity.ok(newsPublicationMapper.toDto(publication));
                })
                .orElseGet(() -> {
                    log.warn("News publication not found with newsId: {}", newsId);
                    return ResponseEntity.notFound().build();
                });
    }
}
