package com.stemadeleine.api.dto;

import java.util.UUID;

public record CreateFormRequest(
        UUID sectionId,
        String name
) {
}

