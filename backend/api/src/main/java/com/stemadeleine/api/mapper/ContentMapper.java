package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.ContentDto;
import com.stemadeleine.api.model.Content;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class ContentMapper {

    private final MediaMapper mediaMapper;

    public ContentMapper(MediaMapper mediaMapper) {
        this.mediaMapper = mediaMapper;
    }

    /**
     * Convert Content entity to ContentDto
     */
    public ContentDto toDto(Content content) {
        if (content == null) {
            return null;
        }

        return new ContentDto(
                content.getId(),
                content.getContentId(),
                content.getOwnerId(),
                content.getVersion(),
                content.getStatus(),
                content.getTitle(),
                content.getBody(),
                content.getSortOrder(),
                content.getIsVisible(),
                content.getAuthor() != null ? content.getAuthor().getUsername() : null,
                content.getCreatedAt(),
                content.getUpdatedAt(),
                content.getContentMedias() != null ?
                        content.getContentMedias().stream()
                                .map(cm -> mediaMapper.toDto(cm.getMedia()))
                                .toList() :
                        Collections.emptyList()
        );
    }
}
