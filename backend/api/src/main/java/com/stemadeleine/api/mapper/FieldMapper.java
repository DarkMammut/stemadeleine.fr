package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.FieldDto;
import com.stemadeleine.api.model.Field;
import org.springframework.stereotype.Component;

@Component
public class FieldMapper {
    public FieldDto toDto(Field field) {
        return new FieldDto(
                field.getId(),
                field.getLabel(),
                field.getInputType(),
                field.getRequired(),
                field.getPlaceholder(),
                field.getDefaultValue(),
                field.getOptions(),
                field.getSortOrder(),
                field.getHelpText(),
                field.getIsVisible()
        );
    }
}

