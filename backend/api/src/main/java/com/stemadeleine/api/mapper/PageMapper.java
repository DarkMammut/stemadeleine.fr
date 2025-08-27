package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.PageDto;
import com.stemadeleine.api.model.Page;

import java.util.List;
import java.util.stream.Collectors;

public class PageMapper {

    public static PageDto toDto(Page page) {
        List<PageDto> childrenDto = page.getChildren() != null
                ? page.getChildren().stream()
                .map(PageMapper::toDto)
                .collect(Collectors.toList())
                : List.of();

        return new PageDto(
                page.getId(),
                page.getPageId(),
                page.getName(),
                page.getTitle(),
                page.getSubTitle(),
                page.getSlug(),
                page.getDescription(),
                page.getStatus(),
                page.getSortOrder(),
                page.getIsVisible(),
                childrenDto
        );
    }
}
