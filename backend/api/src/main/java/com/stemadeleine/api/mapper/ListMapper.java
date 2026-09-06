package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.ListDto;
import com.stemadeleine.api.model.List;
import org.springframework.stereotype.Component;

@Component
public class ListMapper {
    private final ListContentMapper listContentMapper;

    public ListMapper(ListContentMapper listContentMapper) {
        this.listContentMapper = listContentMapper;
    }

    public ListDto toDto(List list) {
        return new ListDto(
                list.getId(),
                list.getModuleId(),
                list.getSection() != null ? list.getSection().getId() : null,
                list.getName(),
                list.getType(),
                list.getVariant() != null ? list.getVariant().name() : null,
                list.getSortOrder(),
                list.getStatus() != null ? list.getStatus().name() : null,
                list.getIsVisible(),
                list.getVersion(),
                list.getContents() != null ? list.getContents().stream().map(listContentMapper::toDto).toList() : null
        );
    }
}
