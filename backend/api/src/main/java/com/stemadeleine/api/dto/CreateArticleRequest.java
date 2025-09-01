package com.stemadeleine.api.dto;

import java.util.UUID;

public record CreateArticleRequest(
        UUID sectionId,
        String name
) {}

