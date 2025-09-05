package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.GalleryDto;
import com.stemadeleine.api.model.Gallery;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class GalleryMapper {
    private final MediaMapper mediaMapper;

    public GalleryMapper(MediaMapper mediaMapper) {
        this.mediaMapper = mediaMapper;
    }

    public GalleryDto toDto(Gallery gallery) {
        return new GalleryDto(
                gallery.getId(),
                gallery.getModuleId(),
                gallery.getSection() != null ? gallery.getSection().getId() : null,
                gallery.getName(),
                gallery.getType(),
                gallery.getVariant() != null ? gallery.getVariant().name() : null,
                gallery.getSortOrder(),
                gallery.getStatus() != null ? gallery.getStatus().name() : null,
                gallery.getIsVisible(),
                gallery.getVersion(),
                gallery.getMedias() != null ? gallery.getMedias().stream().map(mediaMapper::toDto).collect(Collectors.toList()) : null
        );
    }
}
