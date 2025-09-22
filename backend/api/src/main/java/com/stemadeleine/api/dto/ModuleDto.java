package com.stemadeleine.api.dto;

import java.util.List;
import java.util.UUID;

public record ModuleDto(
        UUID id,
        String name,
        String title,
        String type,
        Integer sortOrder,
        UUID sectionId,
        String status,
        Boolean isVisible,
        Integer version,
        UUID moduleId,
        List<MediaDto> medias
) implements ModuleDtoMarker {
}
