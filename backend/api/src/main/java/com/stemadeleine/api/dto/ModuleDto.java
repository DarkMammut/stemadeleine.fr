package com.stemadeleine.api.dto;

import java.util.UUID;

public record ModuleDto(
        UUID id,
        String name,
        String type,
        Integer sortOrder,
        UUID sectionId,
        String status,
        Boolean isVisible,
        Integer version,
        UUID moduleId
) implements ModuleDtoMarker {
}
