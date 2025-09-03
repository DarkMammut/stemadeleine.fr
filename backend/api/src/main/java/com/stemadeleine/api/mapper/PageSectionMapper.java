package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.*;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.*;
import org.mapstruct.Context;
import org.mapstruct.IterableMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PageSectionMapper {

    @Mapping(target = "sections", source = "sections")
    PageSectionDto toDto(Page page);

    @Autowired
    ModuleMapper moduleMapper = null;

    @Autowired
    ContentMapper contentMapper = null;

    @Autowired
    MediaMapper mediaMapper = null;

    default List<ModuleDtoMarker> mapModules(List<Module> modules) {
        return modules == null ? null : modules.stream()
                .map(module -> moduleMapper.toPolymorphicDto(
                        module,
                        content -> contentMapper.toDto(content),
                        media -> mediaMapper.toDto(media)
                ))
                .toList();
    }

    default SectionDto toDto(Section section) {
        return new SectionDto(
                section.getId(),
                section.getSectionId(),
                section.getName(),
                section.getTitle(),
                section.getSortOrder(),
                section.getIsVisible(),
                section.getStatus(),
                mapModules(section.getModules()),
                null
        );
    }

    PageSectionWithoutContentsDto toPageSectionWithoutContentsDto(Page page);

    @IterableMapping(elementTargetType = SectionWithoutContentsDto.class)
    List<SectionWithoutContentsDto> toSectionWithoutContentsDtoList(List<Section> sections);

    SectionWithoutContentsDto toSectionWithoutContentsDto(Section section);

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