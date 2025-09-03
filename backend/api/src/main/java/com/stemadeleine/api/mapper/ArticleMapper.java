package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.ArticleDto;
import com.stemadeleine.api.model.Article;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = ContentMapper.class)
public interface ArticleMapper {
    @Mapping(target = "sectionId", source = "section.id")
    @Mapping(target = "variant", expression = "java(article.getVariant() != null ? article.getVariant().name() : null)")
    @Mapping(target = "status", expression = "java(article.getStatus() != null ? article.getStatus().name() : null)")
    ArticleDto toDto(Article article);
}
