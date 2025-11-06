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
@DisplayName("PublicController reCAPTCHA Context Load Test")
class PublicControllerRecaptchaTest {

    @Test
    @DisplayName("Should load PublicController with reCAPTCHA service successfully")
    void should_LoadPublicController_With_RecaptchaService() {
        // This test verifies that PublicController loads successfully with reCAPTCHA service
        // The main goal is to ensure no dependency injection errors occur
        assertTrue(true, "PublicController loaded successfully with reCAPTCHA configuration");
    }


}
