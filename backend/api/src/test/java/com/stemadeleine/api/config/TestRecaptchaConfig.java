package com.stemadeleine.api.config;

import com.stemadeleine.api.service.RecaptchaService;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Test configuration specifically for reCAPTCHA service
 */
@TestConfiguration
@Profile("test")
public class TestRecaptchaConfig {

    @Bean
    @Primary
    public RecaptchaService mockRecaptchaService() {
        RecaptchaService mockService = mock(RecaptchaService.class);

        // Configure mock to always return true for valid tokens in tests
        when(mockService.validateToken(any(String.class))).thenReturn(true);

        // Return false for null/empty tokens
        when(mockService.validateToken(null)).thenReturn(false);
        when(mockService.validateToken("")).thenReturn(false);
        when(mockService.validateToken("   ")).thenReturn(false);

        return mockService;
    }
}
