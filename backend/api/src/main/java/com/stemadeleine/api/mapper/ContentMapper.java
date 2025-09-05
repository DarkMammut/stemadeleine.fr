package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.ContentDto;
import com.stemadeleine.api.model.Content;
import org.springframework.stereotype.Component;

@Component
public class ContentMapper {
    public ContentDto toDto(Content content) {
        if (content == null) {
            return null;
        }

        return new ContentDto(
                content.getId(),
                content.getOwnerId(),
                content.getVersion(),
                content.getStatus() != null ? content.getStatus().name() : null,
                content.getTitle(),
                content.getBody(),
                content.getSortOrder(),
                content.getIsVisible(),
                null  // medias will be mapped separately
        );
    }
}
