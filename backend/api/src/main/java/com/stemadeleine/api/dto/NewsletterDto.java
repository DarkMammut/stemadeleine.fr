package com.stemadeleine.api.dto;

import com.stemadeleine.api.model.Media;

import java.util.List;
import java.util.UUID;

public record NewsletterDto(
        UUID id,
        UUID moduleId,
        UUID sectionId,
        String name,
        String type,
        String variant,
        String description,
        String detailPageUrl,
        Integer sortOrder,
        String status,
        Boolean isVisible,
        Integer version,
        Media media,
        List<ContentDto> contents
) implements ModuleDtoMarker {
}
