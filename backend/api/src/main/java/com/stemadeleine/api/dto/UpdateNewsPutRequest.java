package com.stemadeleine.api.dto;

import com.stemadeleine.api.model.NewsVariants;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateNewsPutRequest {
    private String name;
    private String title;
    private NewsVariants variant;
    private Integer sortOrder;
}
