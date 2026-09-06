package com.stemadeleine.api.dto;

import com.stemadeleine.api.model.ListVariants;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Requête de mise à jour partielle d'une liste (nom, titre, variante, ordre).
 * Contrairement à {@link UpdateListRequest} (utilisé pour créer une nouvelle
 * version), tous les champs sont optionnels : seuls les champs non nuls sont
 * appliqués, ce qui évite d'écraser les contenus existants de la liste.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateListDetailsRequest {
    private String name;
    private String title;
    private ListVariants variant;
    private Integer sortOrder;
}
