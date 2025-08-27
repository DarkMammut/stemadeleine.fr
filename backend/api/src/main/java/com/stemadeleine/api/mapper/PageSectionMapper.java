package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.*;
import com.stemadeleine.api.model.Content;
import com.stemadeleine.api.model.Media;
import com.stemadeleine.api.model.Page;
import com.stemadeleine.api.model.Section;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PageSectionMapper {

    @Mapping(target = "sections", source = "sections")
    PageSectionDto toDto(Page page);

    SectionDto toDto(Section section);

    ModuleDto toDto(Module module);

    @Mapping(source = "content.id", target = "id")
    @Mapping(source = "content.ownerId", target = "ownerId")
    @Mapping(source = "content.title", target = "title")
    @Mapping(source = "content.body", target = "body")
    @Mapping(source = "content.sortOrder", target = "sortOrder")
    @Mapping(source = "content.isVisible", target = "isVisible")
    @Mapping(source = "content.version", target = "version")
    @Mapping(source = "content.status", target = "status")
    ContentDto toDto(Content content, @Context List<ContentMediaDto> medias);

    ContentMediaDto toDto(Media media);
}