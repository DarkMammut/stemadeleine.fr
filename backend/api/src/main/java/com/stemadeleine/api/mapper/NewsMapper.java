package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.NewsDto;
import com.stemadeleine.api.model.News;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class NewsMapper {
    private final ContentMapper contentMapper;

    public NewsMapper(ContentMapper contentMapper) {
        this.contentMapper = contentMapper;
    }

    public NewsDto toDto(News news) {
        return new NewsDto(
                news.getId(),
                news.getModuleID(),
                news.getSection() != null ? news.getSection().getId() : null,
                news.getName(),
                news.getType(),
                news.getVariant() != null ? news.getVariant().name() : null,
                news.getDescription(),
                news.getStartDate(),
                news.getEndDate(),
                news.getSortOrder(),
                news.getStatus() != null ? news.getStatus().name() : null,
                news.getIsVisible(),
                news.getVersion(),
                news.getMedia(),
                news.getContents() != null ? news.getContents().stream().map(contentMapper::toDto).collect(Collectors.toList()) : null
        );
    }
}

