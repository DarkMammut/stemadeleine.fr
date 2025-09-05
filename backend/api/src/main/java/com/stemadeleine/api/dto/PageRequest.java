package com.stemadeleine.api.dto;


import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record PageRequest(
        UUID pageId,        // null pour nouvelle page, présent pour nouvelle version
        UUID parentPageId,  // requis pour nouvelle page, optionnel pour mise à jour
        @NotBlank String name,
        String title,
        String subTitle,
        String slug,
        String description,
        Boolean isVisible
) {
    // Helper methods pour savoir si c'est une nouvelle page ou une mise à jour
    public boolean isNewPage() {
        return pageId == null;
    }

    public boolean isUpdate() {
        return pageId != null;
    }
}
