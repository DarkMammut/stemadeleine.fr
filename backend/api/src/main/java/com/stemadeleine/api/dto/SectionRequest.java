package com.stemadeleine.api.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record SectionRequest(
        UUID sectionId,    // null pour nouvelle section, présent pour nouvelle version
        UUID pageId,       // requis pour nouvelle section, optionnel pour nouvelle version
        @NotBlank String name,
        String title,
        Boolean isVisible  // visibilité de la section
) {
    // Helper method pour savoir si c'est une nouvelle section ou une nouvelle version
    public boolean isNewSection() {
        return sectionId == null;
    }
}
