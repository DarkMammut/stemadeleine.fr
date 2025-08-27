package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.SectionDto;
import com.stemadeleine.api.model.Section;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SectionMapper {

    @Mapping(source = "sortOrder", target = "sortOrder")
    SectionDto toDto(Section section);
}