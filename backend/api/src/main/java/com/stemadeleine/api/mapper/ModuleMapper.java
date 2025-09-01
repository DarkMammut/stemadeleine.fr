package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.*;
import com.stemadeleine.api.model.Article;
import com.stemadeleine.api.model.Timeline;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.List;
import org.springframework.stereotype.Component;

import java.util.function.Function;

@Component
public class ModuleMapper {

    public ModuleDto toDto(Module module) {
        return new ModuleDto(
                module.getId(),
                module.getName(),
                module.getType(),
                module.getSortOrder(),
                module.getSection() != null ? module.getSection().getId() : null,
                module.getStatus() != null ? module.getStatus().name() : null,
                module.getIsVisible(),
                module.getVersion(),
                module.getModuleID()
        );
    }

    public ArticleDto toDto(Article article, Function<com.stemadeleine.api.model.Content, ContentDto> contentMapper) {
        return new ArticleDto(
                article.getId(),
                article.getModuleID(),
                article.getSection() != null ? article.getSection().getId() : null,
                article.getName(),
                article.getType(),
                article.getVariant() != null ? article.getVariant().name() : null,
                article.getSortOrder(),
                article.getStatus() != null ? article.getStatus().name() : null,
                article.getIsVisible(),
                article.getVersion(),
                article.getContents() != null ? article.getContents().stream().map(contentMapper).toList() : null
        );
    }

    public TimelineDto toDto(Timeline timeline, Function<com.stemadeleine.api.model.Content, ContentDto> contentMapper) {
        return new TimelineDto(
                timeline.getId(),
                timeline.getName(),
                timeline.getType(),
                timeline.getSortOrder(),
                timeline.getSection() != null ? timeline.getSection().getId() : null,
                timeline.getStatus() != null ? timeline.getStatus().name() : null,
                timeline.getIsVisible(),
                timeline.getVersion(),
                timeline.getModuleID(),
                timeline.getVariant() != null ? timeline.getVariant().name() : null,
                timeline.getContents() != null ? timeline.getContents().stream().map(contentMapper).toList() : null
        );
    }

    public ListDto toDto(List list, Function<com.stemadeleine.api.model.Content, ContentDto> contentMapper) {
        return new ListDto(
                list.getId(),
                list.getModuleID(),
                list.getSection() != null ? list.getSection().getId() : null,
                list.getName(),
                list.getType(),
                list.getVariant() != null ? list.getVariant().name() : null,
                list.getSortOrder(),
                list.getStatus() != null ? list.getStatus().name() : null,
                list.getIsVisible(),
                list.getVersion(),
                list.getContents() != null ? list.getContents().stream().map(contentMapper).toList() : null
        );
    }

    public ModuleDtoMarker toPolymorphicDto(Module module, Function<com.stemadeleine.api.model.Content, ContentDto> contentMapper) {
        if (module instanceof Article article) {
            return toDto(article, contentMapper);
        } else if (module instanceof Timeline timeline) {
            return toDto(timeline, contentMapper);
        } else if (module instanceof List list) {
            return toDto(list, contentMapper);
        } else {
            return toDto(module);
        }
    }
}
