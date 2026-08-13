package com.stemadeleine.api.controller;

import com.stemadeleine.api.mapper.ArticleMapper;
import com.stemadeleine.api.mapper.GalleryMapper;
import com.stemadeleine.api.mapper.NewsMapper;
import com.stemadeleine.api.mapper.NewsPublicationMapper;
import com.stemadeleine.api.mapper.NewsletterMapper;
import com.stemadeleine.api.mapper.NewsletterPublicationMapper;
import com.stemadeleine.api.service.ArticleService;
import com.stemadeleine.api.service.GalleryService;
import com.stemadeleine.api.service.NewsPublicationService;
import com.stemadeleine.api.service.NewsService;
import com.stemadeleine.api.service.NewsletterPublicationService;
import com.stemadeleine.api.service.NewsletterService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ModulePublicControllerTest {

    @Mock
    private ArticleService articleService;

    @Mock
    private ArticleMapper articleMapper;

    @Mock
    private GalleryService galleryService;

    @Mock
    private GalleryMapper galleryMapper;

    @Mock
    private NewsletterService newsletterService;

    @Mock
    private NewsletterMapper newsletterMapper;

    @Mock
    private NewsletterPublicationService newsletterPublicationService;

    @Mock
    private NewsletterPublicationMapper newsletterPublicationMapper;

    @Mock
    private NewsService newsService;

    @Mock
    private NewsMapper newsMapper;

    @Mock
    private NewsPublicationService newsPublicationService;

    @Mock
    private NewsPublicationMapper newsPublicationMapper;

    @InjectMocks
    private ModulePublicController controller;

    @Test
    void shouldReturnPublicNewsPage() {
        when(newsPublicationService.getPublishedNews(any())).thenReturn(org.springframework.data.domain.Page.empty());

        var response = controller.getNewsPublications(PageRequest.of(0, 10));

        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getContent()).isEmpty();
        assertThat(response.getBody().getTotalElements()).isZero();
    }
}
