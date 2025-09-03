package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.ListDto;
import com.stemadeleine.api.model.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = ContentMapper.class)
public interface ListMapper {
    @Mapping(target = "sectionId", source = "section.id")
    @Mapping(target = "variant", expression = "java(list.getVariant() != null ? list.getVariant().name() : null)")
    @Mapping(target = "status", expression = "java(list.getStatus() != null ? list.getStatus().name() : null)")
    ListDto toDto(List list);
}
