package com.stemadeleine.api.dto;

import java.util.UUID;

public record ContentMediaDto(
        UUID id,
        String url,
        String altText,
        Integer sortOrder
) {
}
