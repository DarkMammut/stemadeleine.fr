package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.FormDto;
import com.stemadeleine.api.model.Form;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class FormMapper {
    private final FieldMapper fieldMapper;

    public FormMapper(FieldMapper fieldMapper) {
        this.fieldMapper = fieldMapper;
    }

    public FormDto toDto(Form form) {
        return new FormDto(
                form.getId(),
                form.getModuleID(),
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
                form.getFields() != null ? form.getFields().stream().map(fieldMapper::toDto).collect(Collectors.toList()) : null
        );
    }
}

