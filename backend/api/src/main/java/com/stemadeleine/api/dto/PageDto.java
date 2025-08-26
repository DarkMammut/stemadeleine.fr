package com.stemadeleine.api.dto;

import com.stemadeleine.api.model.PageStatus;

import java.util.List;
import java.util.UUID;

public record PageDto(
        UUID id,
        UUID pageId,
        String name,
        String title,
        String subTitle,
        String slug,
        String description,
        PageStatus status,
        Integer sortOrder,
        Boolean isVisible,
        Boolean isDeleted,
        List<PageDto> children
) {
}
