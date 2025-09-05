package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.PageDto;
import com.stemadeleine.api.model.Page;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PageMapper {

    @Mapping(target = "children", source = "children")
    PageDto toDto(Page page);

    List<PageDto> toDtoList(List<Page> pages);
}
