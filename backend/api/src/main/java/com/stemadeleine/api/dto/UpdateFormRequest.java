package com.stemadeleine.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record UpdateFormRequest(
        @NotNull(message = "Module ID cannot be null")
        UUID moduleId,

        @NotBlank(message = "Le nom est requis")
        String name,

        @NotBlank(message = "Title cannot be empty")
        String title,

        @NotBlank(message = "La description est requise")
        String description
) {
}
