package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.CTADto;
import com.stemadeleine.api.model.CTA;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CTAMapper {
    @Mapping(target = "type", constant = "CTA")
    @Mapping(target = "sectionId", source = "section.id")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "variant", source = "variant")
    @Mapping(target = "url", source = "url")
    @Mapping(target = "label", source = "label")
    CTADto toDto(CTA cta);
}
