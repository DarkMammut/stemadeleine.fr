package com.stemadeleine.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                // Unified configuration for all API endpoints
                registry.addMapping("/api/**")
                        .allowedOrigins(
                                "http://localhost:3000", // frontoffice local
                                "http://localhost:3001", // backoffice local
                                "https://stemadeleine.fr", // frontoffice production
                                "https://www.stemadeleine.fr", // frontoffice production with www
                                "https://backoffice.stemadeleine.fr" // backoffice production
                        )
                        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                        .allowCredentials(true)
                        .allowedHeaders("Authorization", "Content-Type", "Cookie");
            }
        };
    }
}
