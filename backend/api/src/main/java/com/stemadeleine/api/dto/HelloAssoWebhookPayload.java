package com.stemadeleine.api.dto;

import lombok.Data;

@Data
public class HelloAssoWebhookPayload {
    private String eventType;
    private String orgSlug;
}

