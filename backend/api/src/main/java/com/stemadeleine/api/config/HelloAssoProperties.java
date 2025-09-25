package com.stemadeleine.api.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Setter
@Getter
@Configuration
@ConfigurationProperties(prefix = "helloasso")
public class HelloAssoProperties {
    private String clientId;
    private String clientSecret;
    private String apiUrl;

}

