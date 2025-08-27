package com.stemadeleine.api.dto;

import java.util.List;
import java.util.UUID;

public record PageSectionDto(
        UUID id,
        String name,
        List<SectionDto> sections
) {
}
