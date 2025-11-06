package com.stemadeleine.api.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Service for validating Google reCAPTCHA tokens
 */
@Slf4j
@Service
public class RecaptchaService {

    private static final String RECAPTCHA_URL = "https://www.google.com/recaptcha/api/siteverify";

    @Value("${app.recaptcha.secret}")
    private String recaptchaSecret;

    private final RestTemplate restTemplate;

    public RecaptchaService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Validates a reCAPTCHA token with Google's verification API
     *
     * @param token the reCAPTCHA token to validate
     * @return true if the token is valid, false otherwise
     */
    public boolean validateToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            log.warn("Empty reCAPTCHA token provided");
            return false;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
            map.add("secret", recaptchaSecret);
            map.add("response", token);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.postForEntity(RECAPTCHA_URL, request, Map.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                @SuppressWarnings("unchecked")
                Map<String, Object> body = response.getBody();
                Boolean success = (Boolean) body.get("success");

                if (Boolean.TRUE.equals(success)) {
                    log.debug("reCAPTCHA token validation successful");
                    return true;
                } else {
                    log.warn("reCAPTCHA token validation failed: {}", body.get("error-codes"));
                    return false;
                }
            } else {
                log.error("Failed to validate reCAPTCHA token - HTTP {}", response.getStatusCode());
                return false;
            }

        } catch (Exception e) {
            log.error("Error validating reCAPTCHA token: {}", e.getMessage());
            return false;
        }
    }
}
