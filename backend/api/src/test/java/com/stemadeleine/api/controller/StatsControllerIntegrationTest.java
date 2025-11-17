package com.stemadeleine.api.controller;

import com.stemadeleine.api.model.PaymentType;
import com.stemadeleine.api.repository.MembershipRepository;
import com.stemadeleine.api.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
public class StatsControllerIntegrationTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private MembershipRepository membershipRepository;

    @InjectMocks
    private StatsController controller;

    @BeforeEach
    public void setup() {
        org.mockito.Mockito.lenient().when(paymentRepository.sumAmountByType(PaymentType.MEMBERSHIP)).thenReturn(20.0);
        org.mockito.Mockito.lenient().when(paymentRepository.sumAmountByType(PaymentType.DONATION)).thenReturn(50.0);
        org.mockito.Mockito.lenient().when(paymentRepository.countDistinctUsersByType(PaymentType.DONATION)).thenReturn(1L);
        org.mockito.Mockito.lenient().when(membershipRepository.countActiveForYear(org.mockito.ArgumentMatchers.anyInt())).thenReturn(1L);
        java.util.List<Object[]> monthly = new java.util.ArrayList<>();
        monthly.add(new Object[]{1, 50.0});
        org.mockito.Mockito.lenient().when(paymentRepository.sumMonthlyByTypeAndYear(PaymentType.DONATION, 2025)).thenReturn(monthly);
    }

    @Test
    public void shouldReturnDashboardStats() {
        Map<String, Object> resp = controller.getDashboardStats(null).getBody();
        assertThat(resp).isNotNull();
        assertThat(resp.get("activeMembers")).isNotNull();
        assertThat(((Number) resp.get("membershipAmount")).doubleValue()).isGreaterThanOrEqualTo(0);
        assertThat(((Number) resp.get("donationsAmount")).doubleValue()).isGreaterThan(0);
    }

    @Test
    public void shouldReturnMonthlyDonations() {
        Map<String, Object> resp = controller.getDonationsByYear(2025).getBody();
        assertThat(resp).isNotNull();
        assertThat(resp.get("monthlyTotals")).isNotNull();
    }
}
