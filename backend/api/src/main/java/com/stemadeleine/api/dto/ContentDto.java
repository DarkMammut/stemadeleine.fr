package com.stemadeleine.api.dto;

import java.util.List;
import java.util.UUID;

public record ContentDto(
        UUID id,
        UUID ownerId,
        Integer version,
        String status,
        String title,
        String body,
        Integer sortOrder,
        Boolean isVisible,
        List<ContentMediaDto> medias
) {
}