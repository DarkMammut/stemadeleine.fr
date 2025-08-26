package com.stemadeleine.api.config;

import com.stemadeleine.api.service.SupabaseStorageClient;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;

import static org.mockito.Mockito.mock;

@TestConfiguration
public class TestSupabaseConfig {

    @Bean
    public SupabaseStorageClient supabaseStorageClient() {
        return mock(SupabaseStorageClient.class);
    }
}
