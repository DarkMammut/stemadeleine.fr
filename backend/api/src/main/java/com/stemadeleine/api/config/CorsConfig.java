package com.stemadeleine.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Value("${CORS_ALLOWED_ORIGINS:}")
    private String additionalOrigins;

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                // Liste des origines de base
                List<String> allowedOrigins = new ArrayList<>(Arrays.asList(
                        "http://localhost:3000", // frontoffice local
                        "http://localhost:3001", // backoffice local
                        "https://stemadeleine.fr", // frontoffice production
                        "https://www.stemadeleine.fr", // frontoffice production with www
                        "https://backoffice.stemadeleine.fr", // backoffice production
                        "https://stemadeleine-fr.vercel.app" // Vercel deployment
                ));

                // Ajout des origines additionnelles depuis la variable d'environnement
                if (additionalOrigins != null && !additionalOrigins.isEmpty()) {
                    Arrays.stream(additionalOrigins.split(","))
                            .map(String::trim)
                            .filter(s -> !s.isEmpty())
                            .forEach(allowedOrigins::add);
                }

                // Unified configuration for all API endpoints
                registry.addMapping("/api/**")
                        .allowedOrigins(allowedOrigins.toArray(new String[0]))
                        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                        .allowCredentials(true)
                        .allowedHeaders("Authorization", "Content-Type", "Cookie");
            }
        };
    }
}
