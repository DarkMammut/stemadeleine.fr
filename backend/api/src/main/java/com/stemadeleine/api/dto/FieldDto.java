package com.stemadeleine.api.dto;

import com.stemadeleine.api.model.FieldInputType;

import java.util.UUID;

public record FieldDto(
        UUID id,
        String label,
        FieldInputType inputType,
        Boolean required,
        String placeholder,
        String defaultValue,
        String options,
        Integer sortOrder,
        String helpText,
        Boolean isVisible
) {
}

