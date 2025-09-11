package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.ModuleDtoMarker;
import com.stemadeleine.api.dto.SectionDto;
import com.stemadeleine.api.model.Section;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring", uses = {ModuleMapper.class, MediaMapper.class, ContentMapper.class})
public interface SectionMapper {

    @Autowired
    ModuleMapper moduleMapper = null;

    @Mapping(target = "modules", expression = "java(mapModules(section))")
    @Mapping(target = "media", source = "media")
    @Mapping(target = "contents", source = "contents")
    SectionDto toDto(Section section);

    default java.util.List<ModuleDtoMarker> mapModules(Section section) {
        if (section == null || section.getModules() == null) {
            return null;
        }
        return section.getModules().stream()
                .map(module -> moduleMapper.toDto(module))
                .collect(java.util.stream.Collectors.toList());
    }
}