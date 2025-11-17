package com.stemadeleine.api.controller;

import com.stemadeleine.api.service.NewsPublicationService;
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
public class NewsPublicationControllerTest {

    @Mock
    private NewsPublicationService service;

    @Mock
    private com.stemadeleine.api.mapper.NewsPublicationMapper newsPublicationMapper;

    @InjectMocks
    private NewsPublicationController controller;

    @BeforeEach
    public void setup() {
    }

    @Test
    public void shouldReturnPublicPage() {
        when(service.getPublishedNews(any())).thenReturn(org.springframework.data.domain.Page.empty());

        var resp = controller.getPublishedNews(org.springframework.data.domain.PageRequest.of(0, 10));
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getContent()).isEmpty();
    }
}
