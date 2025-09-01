package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.ContentDto;
import com.stemadeleine.api.dto.ListDto;
import com.stemadeleine.api.model.List;
import com.stemadeleine.api.model.Content;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class ListMapper {
    private final ContentMapper contentMapper;

    public ListMapper(ContentMapper contentMapper) {
        this.contentMapper = contentMapper;
    }

    public ListDto toDto(List list) {
        return new ListDto(
            list.getId(),
            list.getModuleID(),
            list.getSection() != null ? list.getSection().getId() : null,
            list.getName(),
            list.getType(),
            list.getVariant() != null ? list.getVariant().name() : null,
            list.getSortOrder(),
            list.getStatus() != null ? list.getStatus().name() : null,
            list.getIsVisible(),
            list.getVersion(),
            list.getContents() != null ? list.getContents().stream().map(contentMapper::toDto).collect(Collectors.toList()) : null
        );
    }
}
