package com.stemadeleine.api.dto;

import java.util.UUID;

public record CTADto(
        UUID id,
        UUID moduleID,
        UUID sectionId,
        String name,
        String type,
        Integer sortOrder,
        String status,
        Boolean isVisible,
        Integer version,
        String label,
        String url,
        String variant
) implements ModuleDtoMarker {
}

