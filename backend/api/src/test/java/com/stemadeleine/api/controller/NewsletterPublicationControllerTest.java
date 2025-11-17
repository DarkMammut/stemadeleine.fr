package com.stemadeleine.api.controller;

import com.stemadeleine.api.service.NewsletterPublicationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class NewsletterPublicationControllerTest {

    @Mock
    private NewsletterPublicationService service;

    @Mock
    private com.stemadeleine.api.mapper.NewsletterPublicationMapper newsletterPublicationMapper;

    @InjectMocks
    private NewsletterPublicationController controller;

    @BeforeEach
    public void setup() {
    }

    @Test
    public void shouldReturnPublicPage() {
        when(service.getPublishedNewsletters(any())).thenReturn(org.springframework.data.domain.Page.empty());

        var resp = controller.getPublishedNewsletters(org.springframework.data.domain.PageRequest.of(0, 10));
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getContent()).isEmpty();
    }
}
