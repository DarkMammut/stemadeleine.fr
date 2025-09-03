package com.stemadeleine.api.config;

import com.stemadeleine.api.security.JwtUtil;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

@TestConfiguration
public class TestJwtConfig {

    @Bean
    @Primary
    public JwtUtil jwtUtil() {
        return new JwtUtil();
    }
}
