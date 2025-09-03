package com.stemadeleine.api.dto;

import java.util.UUID;

public record CreateCTARequest(
        UUID sectionId,
        String name
) {
}

