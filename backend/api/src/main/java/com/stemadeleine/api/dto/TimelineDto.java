package com.stemadeleine.api.dto;

import java.util.List;
import java.util.UUID;

public record TimelineDto(
        UUID id,
        String name,
        String type,
        Integer sortOrder,
        UUID sectionId,
        String status,
        Boolean isVisible,
        Integer version,
        UUID moduleId,
        String variant,
        List<ContentDto> contents
) implements ModuleDtoMarker {
}