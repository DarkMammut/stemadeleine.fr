package com.stemadeleine.api.dto;

import com.stemadeleine.api.model.ArticleVariants;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record UpdateArticleRequest(
        @NotNull(message = "Module ID cannot be null")
        UUID moduleId,

        @NotBlank(message = "Name cannot be empty")
        String name,

        @NotBlank(message = "Title cannot be empty")
        String title,

        @NotNull(message = "Variant cannot be null")
        ArticleVariants variant
) {
}
