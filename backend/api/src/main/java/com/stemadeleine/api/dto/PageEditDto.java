package com.stemadeleine.api.dto;

import java.util.UUID;

public record PageEditDto(
        UUID id,
        UUID pageId,
        String name,
        String title,
        String subTitle,
        String description,
        String slug,
        UUID parentPageId,
        String parentPageSlug,
        MediaDto heroMedia
) {
}

