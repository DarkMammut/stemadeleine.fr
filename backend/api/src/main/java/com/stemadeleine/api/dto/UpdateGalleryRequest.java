package com.stemadeleine.api.dto;

import com.stemadeleine.api.model.GalleryVariants;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record UpdateGalleryRequest(
        @NotNull(message = "Module ID cannot be null")
        UUID moduleId,

        @NotBlank(message = "Le nom est requis")
        String name,

        @NotBlank(message = "Title cannot be empty")
        String title,

        @NotNull(message = "Variant cannot be null")
        GalleryVariants variant
) {
}
