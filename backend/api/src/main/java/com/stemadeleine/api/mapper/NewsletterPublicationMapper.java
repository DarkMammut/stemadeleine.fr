package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.NewsletterPublicationDto;
import com.stemadeleine.api.model.NewsletterPublication;
import com.stemadeleine.api.service.ContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class NewsletterPublicationMapper {

    private final MediaMapper mediaMapper;
    private final UserMapper userMapper;
    private final ContentMapper contentMapper;
    private final ContentService contentService;

    /**
     * Convert NewsletterPublication entity to DTO
     */
    public NewsletterPublicationDto toDto(NewsletterPublication publication) {
        if (publication == null) {
            return null;
        }

        // Retrieve contents via newsletterId (owner)
        // This ensures we get the latest contents shared across all versions
        var contents = contentService.getLatestContentsByOwner(publication.getNewsletterId());

        return NewsletterPublicationDto.builder()
                .id(publication.getId())
                .newsletterId(publication.getNewsletterId())
                .name(publication.getName())
                .title(publication.getTitle())
                .description(publication.getDescription())
                .isVisible(publication.getIsVisible())
                .status(publication.getStatus())
                .publishedDate(publication.getPublishedDate())
                .media(publication.getMedia() != null ? mediaMapper.toDto(publication.getMedia()) : null)
                .author(publication.getAuthor() != null ? userMapper.toDto(publication.getAuthor()) : null)
                .contents(contents.stream()
                        .map(contentMapper::toDto)
                        .collect(Collectors.toList()))
                .createdAt(publication.getCreatedAt())
                .updatedAt(publication.getUpdatedAt())
                .build();
    }

    /**
     * Convert list of NewsletterPublication entities to DTOs
     */
    public List<NewsletterPublicationDto> toDtoList(List<NewsletterPublication> publications) {
        if (publications == null) {
            return null;
        }
        return publications.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}
