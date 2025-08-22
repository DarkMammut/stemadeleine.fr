package com.stemadeleine.api.dto;

import java.util.List;
import java.util.UUID;

public record PageDto(
        UUID id,
        String name,
        String title,
        String subTitle,
        String slug,
        String description,
        String navPosition,
        Integer sortOrder,
        Boolean isVisible,
        List<PageDto> children
) {
}
