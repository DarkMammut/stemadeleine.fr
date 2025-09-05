package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.ModuleDtoMarker;
import com.stemadeleine.api.dto.PageSectionDto;
import com.stemadeleine.api.dto.SectionDto;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.Page;
import com.stemadeleine.api.model.Section;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Mapper(componentModel = "spring")
public abstract class PageSectionMapper {

    @Autowired
    protected ModuleMapper moduleMapper;

    @Autowired
    protected ContentMapper contentMapper;

    @Autowired
    protected MediaMapper mediaMapper;

    @Mapping(target = "sections", expression = "java(mapSections(page.getSections()))")
    public abstract PageSectionDto toDto(Page page);

    // Méthode pour filtrer les sections non supprimées
    protected List<SectionDto> mapSections(List<Section> sections) {
        if (sections == null) return null;

        return sections.stream()
                .filter(section -> section.getStatus() != com.stemadeleine.api.model.PublishingStatus.DELETED)
                .map(this::toDto)
                .toList();
    }

    protected List<ModuleDtoMarker> mapModules(List<Module> modules) {
        if (modules == null) return null;

        return modules.stream()
                .map(module -> moduleMapper.toPolymorphicDto(
                        module,
                        content -> contentMapper.toDto(content),
                        media -> mediaMapper.toDto(media)
                ))
                .toList();
    }

    public SectionDto toDto(Section section) {
        if (section == null) return null;

        return new SectionDto(
                section.getId(),
                section.getSectionId(),
                section.getName(),
                section.getTitle(),
                section.getSortOrder(),
                section.getIsVisible(),
                section.getStatus(),
                mapModules(section.getModules()),
                null // contents - pas de contents dans cette DTO selon le contexte
        );
    }
}