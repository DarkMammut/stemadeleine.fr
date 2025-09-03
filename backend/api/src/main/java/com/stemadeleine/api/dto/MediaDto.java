package com.stemadeleine.api.dto;

import java.util.UUID;

public record MediaDto(
        UUID id,
        String fileUrl,
        String fileType,
        String title,
        String altText,
        Boolean isVisible,
        Integer sortOrder
) {
}
