package com.stemadeleine.api.controller;

import com.stemadeleine.api.mapper.NewsPublicationMapper;
import com.stemadeleine.api.model.NewsPublication;
import com.stemadeleine.api.service.NewsPublicationService;
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
public class NewsPublicationControllerIntegrationTest {

    @Mock
    private NewsPublicationService service;

    @Mock
    private NewsPublicationMapper mapper;

    @InjectMocks
    private NewsPublicationController controller;

    @BeforeEach
    public void setup() {
    }

    @Test
    public void shouldReturnPublishedNewsPage() {
        when(service.getPublishedNews(any())).thenReturn(new PageImpl<>(List.of(new NewsPublication())));
        var page = controller.getPublishedNews(org.springframework.data.domain.PageRequest.of(0, 10));
        assertThat(page.getBody()).isNotNull();
        assertThat(page.getBody().getContent()).isNotEmpty();
    }
}
