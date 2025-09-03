package com.stemadeleine.api.dto;

import com.stemadeleine.api.model.Media;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record NewsDto(
        UUID id,
        UUID moduleID,
        UUID sectionId,
        String name,
        String type,
        String variant,
        String description,
        OffsetDateTime startDate,
        OffsetDateTime endDate,
        Integer sortOrder,
        String status,
        Boolean isVisible,
        Integer version,
        Media media,
        List<ContentDto> contents
) implements ModuleDtoMarker {
}

