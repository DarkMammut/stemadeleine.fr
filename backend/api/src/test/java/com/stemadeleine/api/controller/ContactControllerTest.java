package com.stemadeleine.api.controller;

import com.stemadeleine.api.service.ContactService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ContactControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ContactService contactService;

    @InjectMocks
    private ContactController controller;

    @BeforeEach
    public void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .build();
    }

    @Test
    public void shouldReturnUnlinkedPage() throws Exception {
        when(contactService.findUnlinkedContacts(any(org.springframework.data.domain.Pageable.class))).thenReturn(org.springframework.data.domain.Page.empty());

        var resp = controller.getUnlinkedContacts(org.springframework.data.domain.PageRequest.of(0, 10));
        var body = resp.getBody();
        org.assertj.core.api.Assertions.assertThat(body).isNotNull();
        org.assertj.core.api.Assertions.assertThat(body.getContent()).isEmpty();
    }
}
