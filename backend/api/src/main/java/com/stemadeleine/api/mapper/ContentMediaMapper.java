package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.ContentMediaDto;
import com.stemadeleine.api.model.ContentMedia;
import org.springframework.stereotype.Component;

@Component
public class ContentMediaMapper {
    public ContentMediaDto toDto(ContentMedia contentMedia) {
        if (contentMedia == null) return null;
        return new ContentMediaDto(
            contentMedia.getMedia() != null ? contentMedia.getMedia().getId() : null,
            contentMedia.getMedia() != null ? contentMedia.getMedia().getFileUrl() : null,
            contentMedia.getMedia() != null ? contentMedia.getMedia().getAltText() : null,
            contentMedia.getSortOrder() != null ? contentMedia.getSortOrder().intValue() : null
        );
    }
}

