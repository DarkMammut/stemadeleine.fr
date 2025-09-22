package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.ModuleDtoMarker;
import com.stemadeleine.api.dto.SectionDto;
import com.stemadeleine.api.model.Section;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring", uses = {ModuleMapper.class, MediaMapper.class, ContentMapper.class})
public abstract class SectionMapper {

    @Autowired
    protected ModuleMapper moduleMapper;

    @Mapping(target = "modules", expression = "java(mapModules(section))")
    @Mapping(target = "media", source = "media", qualifiedByName = "toMediaDto")
    @Mapping(target = "contents", source = "contents")
    public abstract SectionDto toDto(Section section);

    public java.util.List<ModuleDtoMarker> mapModules(Section section) {
        if (section == null || section.getModules() == null) {
            return null;
        }
        java.util.List<ModuleDtoMarker> result = new java.util.ArrayList<>();
        java.util.Map<String, com.stemadeleine.api.model.Module> uniqueModules = new java.util.HashMap<>();
        for (var module : section.getModules()) {
            try {
                if (module != null) {
                    String key = module.getModuleId() != null ? module.getModuleId().toString() : module.getId().toString();
                    com.stemadeleine.api.model.Module existing = uniqueModules.get(key);
                    // On privilégie la version enrichie (ex : Article)
                    if (existing == null || !existing.getClass().equals(module.getClass())) {
                        uniqueModules.put(key, module);
                    }
                }
            } catch (Exception e) {
                System.err.println("Erreur lors du mapping d'un module dans SectionMapper : " + e.getMessage());
            }
        }
        for (var module : uniqueModules.values()) {
            result.add(moduleMapper.toDto(module));
        }
        return result;
    }
}