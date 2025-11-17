package com.stemadeleine.api.controller;

import com.stemadeleine.api.mapper.NewsletterPublicationMapper;
import com.stemadeleine.api.model.NewsletterPublication;
import com.stemadeleine.api.service.NewsletterPublicationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class NewsletterPublicationControllerIntegrationTest {

    @Mock
    private NewsletterPublicationService service;

    @Mock
    private NewsletterPublicationMapper mapper;

    @InjectMocks
    private NewsletterPublicationController controller;

    @BeforeEach
    public void setup() {
    }

    @Test
    public void shouldReturnPublishedNewsletterPage() {
        when(service.getPublishedNewsletters(any())).thenReturn(new PageImpl<>(List.of(new NewsletterPublication())));
        var page = controller.getPublishedNewsletters(org.springframework.data.domain.PageRequest.of(0, 10));
        assertThat(page.getBody()).isNotNull();
        assertThat(page.getBody().getContent()).isNotEmpty();
    }
}
