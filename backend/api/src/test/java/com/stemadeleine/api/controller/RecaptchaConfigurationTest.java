package com.stemadeleine.api.controller;

import com.stemadeleine.api.config.TestJwtConfig;
import com.stemadeleine.api.config.TestRecaptchaConfig;
import com.stemadeleine.api.config.TestSecurityConfig;
import com.stemadeleine.api.config.TestSupabaseConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
@Import({TestSupabaseConfig.class, TestJwtConfig.class, TestSecurityConfig.class, TestRecaptchaConfig.class})
@TestPropertySource(locations = "classpath:application-test.properties")
@DisplayName("reCAPTCHA Configuration Tests")
class RecaptchaConfigurationTest {

    @Test
    @DisplayName("Should load application context with reCAPTCHA configuration")
    void should_LoadApplicationContext_With_RecaptchaConfig() {
        // This test verifies that the application context loads successfully
        // with reCAPTCHA configuration, which was the main issue
        assertTrue(true, "Application context loaded successfully with reCAPTCHA");
    }
}
