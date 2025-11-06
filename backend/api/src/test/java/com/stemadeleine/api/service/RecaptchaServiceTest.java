package com.stemadeleine.api.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("RecaptchaService Tests")
class RecaptchaServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private RecaptchaService recaptchaService;

    private static final String TEST_SECRET = "test-secret-key";
    private static final String TEST_TOKEN = "test-token";

    @BeforeEach
    void setUp() {
        // Set the secret key using reflection since it's injected via @Value
        ReflectionTestUtils.setField(recaptchaService, "recaptchaSecret", TEST_SECRET);
        // Set the RestTemplate manually since we're using constructor injection
        ReflectionTestUtils.setField(recaptchaService, "restTemplate", restTemplate);
    }

    @Test
    @DisplayName("Should return true for valid reCAPTCHA token")
    void should_ReturnTrue_When_TokenIsValid() {
        // Given
        Map<String, Object> successResponse = new HashMap<>();
        successResponse.put("success", true);

        ResponseEntity<Map> mockResponse = new ResponseEntity<>(successResponse, HttpStatus.OK);
        when(restTemplate.postForEntity(anyString(), any(), eq(Map.class)))
                .thenReturn(mockResponse);

        // When
        boolean result = recaptchaService.validateToken(TEST_TOKEN);

        // Then
        assertTrue(result);
        verify(restTemplate).postForEntity(anyString(), any(), eq(Map.class));
    }

    @Test
    @DisplayName("Should return false for invalid reCAPTCHA token")
    void should_ReturnFalse_When_TokenIsInvalid() {
        // Given
        Map<String, Object> failureResponse = new HashMap<>();
        failureResponse.put("success", false);
        failureResponse.put("error-codes", new String[]{"invalid-input-response"});

        ResponseEntity<Map> mockResponse = new ResponseEntity<>(failureResponse, HttpStatus.OK);
        when(restTemplate.postForEntity(anyString(), any(), eq(Map.class)))
                .thenReturn(mockResponse);

        // When
        boolean result = recaptchaService.validateToken(TEST_TOKEN);

        // Then
        assertFalse(result);
        verify(restTemplate).postForEntity(anyString(), any(), eq(Map.class));
    }

    @Test
    @DisplayName("Should return false for null or empty token")
    void should_ReturnFalse_When_TokenIsNullOrEmpty() {
        // Test null token
        assertFalse(recaptchaService.validateToken(null));

        // Test empty token
        assertFalse(recaptchaService.validateToken(""));

        // Test blank token
        assertFalse(recaptchaService.validateToken("   "));

        // Verify no API calls were made
        verifyNoInteractions(restTemplate);
    }

    @Test
    @DisplayName("Should return false when API call fails")
    void should_ReturnFalse_When_ApiCallFails() {
        // Given
        when(restTemplate.postForEntity(anyString(), any(), eq(Map.class)))
                .thenThrow(new RuntimeException("Network error"));

        // When
        boolean result = recaptchaService.validateToken(TEST_TOKEN);

        // Then
        assertFalse(result);
        verify(restTemplate).postForEntity(anyString(), any(), eq(Map.class));
    }

    @Test
    @DisplayName("Should return false when API returns non-200 status")
    void should_ReturnFalse_When_ApiReturnsErrorStatus() {
        // Given
        ResponseEntity<Map> mockResponse = new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        when(restTemplate.postForEntity(anyString(), any(), eq(Map.class)))
                .thenReturn(mockResponse);

        // When
        boolean result = recaptchaService.validateToken(TEST_TOKEN);

        // Then
        assertFalse(result);
        verify(restTemplate).postForEntity(anyString(), any(), eq(Map.class));
    }
}
