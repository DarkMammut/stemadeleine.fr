package com.stemadeleine.api.dto;

import java.util.UUID;

public record CreateSectionRequest(
        UUID pageId,
        String name
) {
}