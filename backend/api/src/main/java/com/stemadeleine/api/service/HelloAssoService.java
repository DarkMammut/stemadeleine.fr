package com.stemadeleine.api.service;

import com.stemadeleine.api.config.HelloAssoProperties;
import com.stemadeleine.api.dto.HelloAssoMembershipItemDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Service
public class HelloAssoService {
    private final HelloAssoProperties properties;
    private final WebClient webClient;

    @Autowired
    public HelloAssoService(HelloAssoProperties properties) {
        this.properties = properties;
        this.webClient = WebClient.builder()
                .baseUrl(properties.getApiUrl())
                .build();
    }

    public Mono<String> getAccessToken() {
        return webClient.post()
                .uri("/oauth2/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .bodyValue("grant_type=client_credentials&client_id=" + properties.getClientId() +
                        "&client_secret=" + properties.getClientSecret() + "&scope=api")
                .retrieve()
                .bodyToMono(Map.class)
                .map(body -> (String) body.get("access_token"));
    }

    public Mono<String> getOrganizationInfo(String orgSlug) {
        return getAccessToken().flatMap(token ->
                webClient.get()
                        .uri("/v5/organizations/" + orgSlug)
                        .header("Authorization", "Bearer " + token)
                        .retrieve()
                        .bodyToMono(String.class)
        );
    }

    public Mono<List<HelloAssoMembershipItemDto>> getMembershipItems(String orgSlug, String formSlug) {
        return getAccessToken().flatMap(token ->
                webClient.get()
                        .uri("/v5/organizations/" + orgSlug + "/forms/membership/" + formSlug + "/items")
                        .header("Authorization", "Bearer " + token)
                        .retrieve()
                        .bodyToFlux(HelloAssoMembershipItemDto.class)
                        .collectList()
        );
    }
}
