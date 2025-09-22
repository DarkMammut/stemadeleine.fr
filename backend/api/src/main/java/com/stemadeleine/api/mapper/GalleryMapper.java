package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.GalleryDto;
import com.stemadeleine.api.model.Gallery;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface GalleryMapper {
    @Mapping(target = "sectionId", source = "section.id")
    @Mapping(target = "variant", expression = "java(gallery.getVariant() != null ? gallery.getVariant().name() : null)")
    @Mapping(target = "status", expression = "java(gallery.getStatus() != null ? gallery.getStatus().name() : null)")
    GalleryDto toDto(Gallery gallery);
}
