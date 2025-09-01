package com.stemadeleine.api.dto;

import java.util.List;
import java.util.UUID;

public record PageSectionWithoutContentsDto(
        UUID id,
        String name,
        List<SectionWithoutContentsDto> sections
) {
}

