package com.stemadeleine.api.controller;

import com.stemadeleine.api.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class StatsControllerUnitTest {

    private MockMvc mockMvc;

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private StatsController controller;

    @BeforeEach
    public void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    public void shouldReturnDonationsForYear() throws Exception {
        // mock repository returning empty monthly aggregation
        when(paymentRepository.sumMonthlyByTypeAndYear(any(com.stemadeleine.api.model.PaymentType.class), anyInt())).thenReturn(java.util.Collections.emptyList());

        mockMvc.perform(get("/api/stats/donations?year=2025").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.monthlyTotals").exists());
    }
}
