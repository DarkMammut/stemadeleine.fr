package com.stemadeleine.api.dto;

import java.util.UUID;

public record CreateNewsRequest(
        UUID sectionId,
        String name
) {
}

