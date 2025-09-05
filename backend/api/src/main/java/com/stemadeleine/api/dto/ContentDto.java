package com.stemadeleine.api.dto;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.List;
import java.util.UUID;

public record ContentDto(
        UUID id,
        UUID ownerId,
        Integer version,
        String status,
        String title,
        JsonNode body,
        Integer sortOrder,
        Boolean isVisible,
        List<ContentMediaDto> medias
) {
}