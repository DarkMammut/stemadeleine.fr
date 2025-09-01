package com.stemadeleine.api.dto;

import com.stemadeleine.api.model.PublishingStatus;
import java.util.List;
import java.util.UUID;

public record SectionWithoutContentsDto(
        UUID id,
        UUID sectionId,
        String name,
        String title,
        Integer sortOrder,
        Boolean isVisible,
        PublishingStatus status,
        List<ModuleDto> modules
) {
}

