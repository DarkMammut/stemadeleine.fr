package com.stemadeleine.api.dto;

import com.stemadeleine.api.model.Media;

import java.util.List;
import java.util.UUID;

public record FormDto(
        UUID id,
        UUID moduleID,
        UUID sectionId,
        String name,
        String type,
        Integer sortOrder,
        String status,
        Boolean isVisible,
        Integer version,
        String description,
        Media media,
        String title,
        List<FieldDto> fields
) implements ModuleDtoMarker {
}

