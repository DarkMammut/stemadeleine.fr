package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.ListContentDto;
import com.stemadeleine.api.model.ListContent;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class ListContentMapper {

    private final MediaMapper mediaMapper;

    public ListContentMapper(MediaMapper mediaMapper) {
        this.mediaMapper = mediaMapper;
    }

    public ListContentDto toDto(ListContent content) {
        if (content == null) {
            return null;
        }

        return new ListContentDto(
                content.getId(),
                content.getContentId(),
                content.getTitle(),
                content.getBody(),
                content.getSortOrder(),
                content.getIsVisible(),
                content.getLinkUrl(),
                content.getMedias() != null ?
                        content.getMedias().stream()
                                .map(mediaMapper::toDto)
                                .toList() :
                        Collections.emptyList()
        );
    }
}
