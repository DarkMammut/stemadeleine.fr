package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.ModuleDto;
import com.stemadeleine.api.model.Module;
import org.springframework.stereotype.Component;

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
                module.getIsVisible()
        );
    }
}
