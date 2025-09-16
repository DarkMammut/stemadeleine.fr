package com.stemadeleine.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@Builder
public record CreateNewsPublicationRequest(
        @NotBlank(message = "Name is required")
        String name,

        @NotBlank(message = "Title is required")
        String title,

        String description,

        Boolean isVisible,

        OffsetDateTime publishedDate,

        UUID mediaId
) {
}
