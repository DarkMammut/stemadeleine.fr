package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.MediaDto;
import com.stemadeleine.api.model.Media;
import org.springframework.stereotype.Component;

@Component
public class MediaMapper {
    public MediaDto toDto(Media media) {
        if (media == null) {
            return null;
        }

        return new MediaDto(
                media.getId(),
                media.getFileUrl(),
                media.getTitle(),
                media.getAltText(),
                media.getFileType(),
                media.getIsVisible(),
                media.getSortOrder()
        );
    }
}
