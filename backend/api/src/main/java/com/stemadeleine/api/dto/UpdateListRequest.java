package com.stemadeleine.api.dto;

import com.stemadeleine.api.model.ListVariants;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record UpdateListRequest(
        @NotNull(message = "Module ID cannot be null")
        UUID moduleId,

        @NotBlank(message = "Le nom est requis")
        String name,

        @NotBlank(message = "Title cannot be empty")
        String title,

        @NotNull(message = "La variante est requise")
        ListVariants variant
) {

}

