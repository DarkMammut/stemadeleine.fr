package com.stemadeleine.api.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AccountDto(
        UUID id,
        String email,
        String role,
        String provider,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}