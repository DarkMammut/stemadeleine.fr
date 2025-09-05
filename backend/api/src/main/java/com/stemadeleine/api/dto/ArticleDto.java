package com.stemadeleine.api.dto;

import java.util.List;
import java.util.UUID;

public record ArticleDto(
        UUID id,
        UUID moduleId,
        UUID sectionId,
        String name,
        String type,
        String variant,
        Integer sortOrder,
        String status,
        Boolean isVisible,
        Integer version,
        List<ContentDto> contents
) implements ModuleDtoMarker {
}
