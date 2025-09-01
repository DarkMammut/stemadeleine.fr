package com.stemadeleine.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateListRequest {
    private String name;
    private UUID sectionId;
    // Ajoute d'autres champs modifiables si besoin
}

