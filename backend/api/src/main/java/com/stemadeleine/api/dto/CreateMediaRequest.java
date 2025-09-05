package com.stemadeleine.api.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateMediaRequest(
        @NotBlank(message = "File URL cannot be empty")
        String fileUrl,

        String title,
        String altText,
        String fileType,
        Integer fileSize
) {
}
