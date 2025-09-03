package com.stemadeleine.api.dto;

import java.util.UUID;

public record CreateNewsletterRequest(
    UUID sectionId,
    String name
) {}

