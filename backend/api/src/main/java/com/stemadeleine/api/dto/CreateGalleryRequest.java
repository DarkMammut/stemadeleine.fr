package com.stemadeleine.api.dto;

import java.util.List;
import java.util.UUID;

public record CreateGalleryRequest(
        UUID sectionId,
        String name,
        List<UUID> mediaIds
) {
}

