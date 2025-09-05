package com.stemadeleine.api.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record CreatePageRequest(
        UUID parentPageId, // Optionnel car les pages racines n'ont pas de parent

        @NotBlank(message = "Name cannot be empty")
        String name
        ) {
}