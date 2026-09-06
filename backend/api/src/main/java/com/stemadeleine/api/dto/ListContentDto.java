package com.stemadeleine.api.dto;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.List;
import java.util.UUID;

public record ListContentDto(
        UUID id,
        UUID contentId,
        String title,
        JsonNode body,
        Integer sortOrder,
        Boolean isVisible,
        String linkUrl,
        List<MediaDto> medias
) {
}
