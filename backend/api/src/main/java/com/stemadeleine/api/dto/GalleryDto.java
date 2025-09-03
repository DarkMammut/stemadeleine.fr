package com.stemadeleine.api.dto;

import java.util.List;
import java.util.UUID;

public record GalleryDto(
        UUID id,
        UUID moduleID,
        UUID sectionId,
        String name,
        String type,
        String variant,
        Integer sortOrder,
        String status,
        Boolean isVisible,
        Integer version,
        List<MediaDto> medias
) implements ModuleDtoMarker {
}

