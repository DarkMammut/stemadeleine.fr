package com.stemadeleine.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateModuleRequest(
        @NotNull(message = "Section ID cannot be null")
        UUID sectionId,

        @NotBlank(message = "Name cannot be empty")
        String name
) {
}
