package com.stemadeleine.api;

import com.stemadeleine.api.config.TestSupabaseConfig;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestSupabaseConfig.class)
class ApiApplicationTests {
    @Test
    void contextLoads() {
    }
}