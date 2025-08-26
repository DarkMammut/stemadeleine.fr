package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.MediaDto;
import com.stemadeleine.api.dto.PageEditDto;
import com.stemadeleine.api.model.Page;
import org.springframework.stereotype.Component;

@Component
public class PageEditMapper {

    public PageEditDto toDto(Page page) {
        MediaDto heroMediaDto = null;
        if (page.getHeroMedia() != null) {
            heroMediaDto = new MediaDto(
                    page.getHeroMedia().getId(),
                    page.getHeroMedia().getFileUrl(),
                    page.getHeroMedia().getAltText()
            );
        }

        return new PageEditDto(
                page.getId(),
                page.getPageId(),
                page.getName(),
                page.getTitle(),
                page.getSubTitle(),
                page.getDescription(),
                page.getSlug(),
                page.getParentPage() != null ? page.getParentPage().getId() : null,
                page.getParentPage() != null ? page.getParentPage().getSlug() : null,
                heroMediaDto
        );
    }
}
