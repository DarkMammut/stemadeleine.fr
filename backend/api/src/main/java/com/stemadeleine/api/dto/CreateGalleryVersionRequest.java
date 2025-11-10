package com.stemadeleine.api.dto;

import com.stemadeleine.api.model.GalleryVariants;

import java.util.UUID;

public record CreateGalleryVersionRequest(
        UUID moduleId,
        String name,
        String title,
        GalleryVariants variant
) {
}

