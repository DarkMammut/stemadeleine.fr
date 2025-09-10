package com.stemadeleine.api.config;

import com.stemadeleine.api.service.SupabaseStorageClient;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;

import static org.mockito.Mockito.mock;

@TestConfiguration
public class TestSecurityConfig {

    @Bean
    @Primary
    public UserDetailsService testUserDetailsService() {
        // Utiliser directement BCryptPasswordEncoder pour éviter la dépendance circulaire
        PasswordEncoder encoder = new BCryptPasswordEncoder();

        UserDetails admin = User.builder()
                .username("admin@test.com")
                .password(encoder.encode("password"))
                .roles("ADMIN")
                .build();

        UserDetails user = User.builder()
                .username("user@test.com")
                .password(encoder.encode("password"))
                .roles("USER")
                .build();

        return new InMemoryUserDetailsManager(admin, user);
    }

    @Bean
    @Primary
    public SupabaseStorageClient mockSupabaseStorageClient() {
        return mock(SupabaseStorageClient.class);
    }
}
