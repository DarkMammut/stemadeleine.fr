package com.stemadeleine.api.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.stemadeleine.api.model.PublishingStatus;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record ContentDto(
        UUID id,
        UUID contentId,
        UUID ownerId,
        Integer version,
        PublishingStatus status,
        String title,
        JsonNode body,
        Integer sortOrder,
        Boolean isVisible,
        String authorUsername,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        List<MediaDto> medias
) {
}
