package com.stemadeleine.api.dto;

import com.stemadeleine.api.model.GalleryVariants;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateGalleryRequest {
    private String name;
    private String title;
    private GalleryVariants variant;
    private Integer sortOrder;
}

