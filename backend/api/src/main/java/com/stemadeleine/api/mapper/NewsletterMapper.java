package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.NewsletterDto;
import com.stemadeleine.api.model.Newsletter;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class NewsletterMapper {
    private final ContentMapper contentMapper;

    public NewsletterMapper(ContentMapper contentMapper) {
        this.contentMapper = contentMapper;
    }

    public NewsletterDto toDto(Newsletter newsletter) {
        return new NewsletterDto(
                newsletter.getId(),
                newsletter.getModuleId(),
                newsletter.getSection() != null ? newsletter.getSection().getId() : null,
                newsletter.getName(),
                newsletter.getType(),
                newsletter.getVariant() != null ? newsletter.getVariant().name() : null,
                newsletter.getDescription(),
                newsletter.getSortOrder(),
                newsletter.getStatus() != null ? newsletter.getStatus().name() : null,
                newsletter.getIsVisible(),
                newsletter.getVersion(),
                newsletter.getMedia(),
                newsletter.getContents() != null ? newsletter.getContents().stream().map(contentMapper::toDto).collect(Collectors.toList()) : null
        );
    }
}

