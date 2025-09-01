package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.ContentDto;
import com.stemadeleine.api.model.Content;
import org.springframework.stereotype.Component;

import com.stemadeleine.api.mapper.ContentMediaMapper;
import com.stemadeleine.api.model.ContentMedia;
import java.util.stream.Collectors;

@Component
public class ContentMapper {
    private final ContentMediaMapper contentMediaMapper;

    public ContentMapper(ContentMediaMapper contentMediaMapper) {
        this.contentMediaMapper = contentMediaMapper;
    }

    public ContentDto toDto(Content content) {
        if (content == null) return null;
        return new ContentDto(
            content.getId(),
            content.getOwnerId(),
            content.getVersion(),
            content.getStatus() != null ? content.getStatus().name() : null,
            content.getTitle(),
            content.getBody(),
            content.getSortOrder(),
            content.getIsVisible(),
            content.getContentMedias() != null ? content.getContentMedias().stream().map(contentMediaMapper::toDto).collect(Collectors.toList()) : null
        );
    }
}
