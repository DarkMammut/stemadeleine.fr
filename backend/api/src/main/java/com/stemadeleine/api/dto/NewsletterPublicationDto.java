package com.stemadeleine.api.dto;

import com.stemadeleine.api.model.PublishingStatus;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Builder
public record NewsletterPublicationDto(
        UUID id,
        UUID newsletterId,
        String name,
        String title,
        String description,
        Boolean isVisible,
        PublishingStatus status,
        OffsetDateTime publishedDate,
        MediaDto media,
        UserDto author,
        List<ContentDto> contents,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
