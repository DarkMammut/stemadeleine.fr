package com.stemadeleine.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

public record CreateListRequest (
        UUID sectionId,
        String name
) {}

