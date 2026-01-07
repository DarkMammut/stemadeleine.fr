package com.stemadeleine.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateNewsletterPagesRequest(
        @NotNull(message = "Parent page ID cannot be null")
        UUID parentPageId,

        @NotBlank(message = "Newsletters page name cannot be empty")
        String newslettersPageName,

        @NotBlank(message = "Newsletters page slug cannot be empty")
        String newslettersPageSlug,

        @NotBlank(message = "Detail page name cannot be empty")
        String detailPageName,

        @NotBlank(message = "Detail page slug cannot be empty")
        String detailPageSlug,

        @NotBlank(message = "Section name cannot be empty")
        String sectionName,

        @NotBlank(message = "Newsletter module name cannot be empty")
        String newsletterModuleName
) {
}

