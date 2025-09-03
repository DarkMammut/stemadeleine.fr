package com.stemadeleine.api;

import com.stemadeleine.api.config.TestJwtConfig;
import com.stemadeleine.api.config.TestSecurityConfig;
import com.stemadeleine.api.config.TestSupabaseConfig;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(classes = {ApiApplication.class})
@ActiveProfiles("test")
@Import({TestSupabaseConfig.class, TestJwtConfig.class, TestSecurityConfig.class})
@TestPropertySource(locations = "classpath:application-test.properties")
class ApiApplicationTests {
    @Test
    void contextLoads() {
    }
}