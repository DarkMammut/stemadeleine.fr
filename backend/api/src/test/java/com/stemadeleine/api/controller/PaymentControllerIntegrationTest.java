package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.PaymentCreateDto;
import com.stemadeleine.api.model.Payment;
import com.stemadeleine.api.model.PaymentType;
import com.stemadeleine.api.service.PaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class PaymentControllerIntegrationTest {

    private MockMvc mockMvc;

    @Mock
    private PaymentService paymentService;

    @InjectMocks
    private PaymentController controller;

    @BeforeEach
    public void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    public void shouldCreateGetAndDeletePayment() throws Exception {
        PaymentCreateDto dto = PaymentCreateDto.builder()
                .amount(15.0)
                .currency("EUR")
                .paymentDate(LocalDate.now())
                .type(PaymentType.DONATION)
                .build();

        Payment p = new Payment();
        p.setId(UUID.randomUUID());
        p.setAmount(15.0);
        p.setPaymentDate(LocalDate.now());
        p.setType(PaymentType.DONATION);

        when(paymentService.createPayment(any())).thenReturn(p);
        when(paymentService.getPaymentById(p.getId())).thenReturn(Optional.of(p));

        var resp = controller.addPayment(dto);
        assertThat(resp.getStatusCode().is2xxSuccessful()).isTrue();
        Payment created = resp.getBody();
        assertThat(created).isNotNull();

        var fetched = controller.getPaymentById(created.getId());
        assertThat(fetched.getStatusCode().is2xxSuccessful()).isTrue();
    }
}
