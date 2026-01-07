package com.stemadeleine.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateNewsletterPagesResponse {
    private UUID newslettersPageId;
    private UUID detailPageId;
    private UUID sectionId;
    private UUID newsletterModuleId;
    private String message;
}

