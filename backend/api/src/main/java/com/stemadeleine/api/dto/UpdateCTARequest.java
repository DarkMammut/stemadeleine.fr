package com.stemadeleine.api.dto;

import com.stemadeleine.api.model.CtaVariants;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record UpdateCTARequest(
        @NotNull(message = "Module ID cannot be null")
        UUID moduleId,

        @NotBlank(message = "Le nom est requis")
        String name,

        @NotBlank(message = "Title cannot be empty")
        String title,

        @NotBlank(message = "Le label est requis")
        String label,

        @NotBlank(message = "L'URL est requise")
        String url,

        @NotNull(message = "La variante est requise")
        CtaVariants variant
) {
}
