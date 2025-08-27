package com.stemadeleine.api.dto;

import java.util.UUID;

public record CreateModuleRequest(
        UUID sectionId,
        String name,
        String type
) {
}
