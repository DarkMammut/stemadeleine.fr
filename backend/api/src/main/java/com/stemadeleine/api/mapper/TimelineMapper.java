package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.TimelineDto;
import com.stemadeleine.api.model.Timeline;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = ContentMapper.class)
public interface TimelineMapper {
    @Mapping(target = "sectionId", source = "section.id")
    @Mapping(target = "variant", expression = "java(timeline.getVariant() != null ? timeline.getVariant().name() : null)")
    @Mapping(target = "status", expression = "java(timeline.getStatus() != null ? timeline.getStatus().name() : null)")
    TimelineDto toDto(Timeline timeline);
}
