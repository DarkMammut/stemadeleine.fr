package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.NewsPublicationDto;
import com.stemadeleine.api.model.NewsPublication;
import com.stemadeleine.api.service.ContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class NewsPublicationMapper {

    private final MediaMapper mediaMapper;
    private final UserMapper userMapper;
    private final ContentMapper contentMapper;
    private final ContentService contentService;

    /**
     * Convert NewsPublication entity to DTO
     */
    public NewsPublicationDto toDto(NewsPublication publication) {
        if (publication == null) {
            return null;
        }

        // Retrieve contents via newsId (owner)
        // This ensures we get the latest contents shared across all versions
        var contents = contentService.getLatestContentsByOwner(publication.getNewsId());

        return NewsPublicationDto.builder()
                .id(publication.getId())
                .newsId(publication.getNewsId())
                .name(publication.getName())
                .title(publication.getTitle())
                .description(publication.getDescription())
                .isVisible(publication.getIsVisible())
                .status(publication.getStatus())
                .publishedDate(publication.getPublishedDate())
                .startDate(publication.getStartDate())
                .endDate(publication.getEndDate())
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
     * Convert list of NewsPublication entities to DTOs
     */
    public List<NewsPublicationDto> toDtoList(List<NewsPublication> publications) {
        if (publications == null) {
            return null;
        }
        return publications.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}
