package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.*;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.*;
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
                module.getModuleId()
        );
    }

    public ArticleDto toDto(Article article, Function<com.stemadeleine.api.model.Content, ContentDto> contentMapper) {
        return new ArticleDto(
                article.getId(),
                article.getModuleId(),
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
                timeline.getModuleId(),
                timeline.getVariant() != null ? timeline.getVariant().name() : null,
                timeline.getContents() != null ? timeline.getContents().stream().map(contentMapper).toList() : null
        );
    }

    public ListDto toDto(List list, Function<com.stemadeleine.api.model.Content, ContentDto> contentMapper) {
        return new ListDto(
                list.getId(),
                list.getModuleId(),
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

    public NewsletterDto toDto(Newsletter newsletter, Function<com.stemadeleine.api.model.Content, ContentDto> contentMapper) {
        return new NewsletterDto(
                newsletter.getId(),
                newsletter.getModuleId(),
                newsletter.getSection() != null ? newsletter.getSection().getId() : null,
                newsletter.getName(),
                newsletter.getType(),
                newsletter.getVariant() != null ? newsletter.getVariant().name() : null,
                newsletter.getDescription(),
                newsletter.getStartDate(),
                newsletter.getSortOrder(),
                newsletter.getStatus() != null ? newsletter.getStatus().name() : null,
                newsletter.getIsVisible(),
                newsletter.getVersion(),
                newsletter.getMedia(),
                newsletter.getContents() != null ? newsletter.getContents().stream().map(contentMapper).toList() : null
        );
    }

    public NewsDto toDto(News news, Function<com.stemadeleine.api.model.Content, ContentDto> contentMapper) {
        return new NewsDto(
                news.getId(),
                news.getModuleId(),
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
                news.getContents() != null ? news.getContents().stream().map(contentMapper).toList() : null
        );
    }

    public CTADto toDto(CTA cta) {
        return new CTADto(
                cta.getId(),
                cta.getModuleId(),
                cta.getSection() != null ? cta.getSection().getId() : null,
                cta.getName(),
                cta.getType(),
                cta.getSortOrder(),
                cta.getStatus() != null ? cta.getStatus().name() : null,
                cta.getIsVisible(),
                cta.getVersion(),
                cta.getLabel(),
                cta.getUrl(),
                cta.getVariant() != null ? cta.getVariant().name() : null
        );
    }

    public GalleryDto toDto(Gallery gallery, Function<Media, MediaDto> mediaMapper) {
        return new GalleryDto(
                gallery.getId(),
                gallery.getModuleId(),
                gallery.getSection() != null ? gallery.getSection().getId() : null,
                gallery.getName(),
                gallery.getType(),
                gallery.getVariant() != null ? gallery.getVariant().name() : null,
                gallery.getSortOrder(),
                gallery.getStatus() != null ? gallery.getStatus().name() : null,
                gallery.getIsVisible(),
                gallery.getVersion(),
                gallery.getMedias() != null ? gallery.getMedias().stream().map(mediaMapper).toList() : null
        );
    }

    public FormDto toDto(Form form, Function<Field, FieldDto> fieldMapper) {
        return new FormDto(
                form.getId(),
                form.getModuleId(),
                form.getSection() != null ? form.getSection().getId() : null,
                form.getName(),
                form.getType(),
                form.getSortOrder(),
                form.getStatus() != null ? form.getStatus().name() : null,
                form.getIsVisible(),
                form.getVersion(),
                form.getDescription(),
                form.getMedia(),
                form.getTitle(),
                form.getFields() != null ? form.getFields().stream().map(fieldMapper).toList() : null
        );
    }

    public ModuleDtoMarker toPolymorphicDto(Module module, Function<com.stemadeleine.api.model.Content, ContentDto> contentMapper, Function<Media, MediaDto> mediaMapper) {
        if (module instanceof Article article) {
            return toDto(article, contentMapper);
        } else if (module instanceof Timeline timeline) {
            return toDto(timeline, contentMapper);
        } else if (module instanceof List list) {
            return toDto(list, contentMapper);
        } else if (module instanceof Newsletter newsletter) {
            return toDto(newsletter, contentMapper);
        } else if (module instanceof News news) {
            return toDto(news, contentMapper);
        } else if (module instanceof CTA cta) {
            return toDto(cta);
        } else if (module instanceof Gallery gallery) {
            return toDto(gallery, mediaMapper);
        }
        return toDto(module);
    }
}
