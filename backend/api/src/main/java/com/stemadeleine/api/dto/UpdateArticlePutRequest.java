package com.stemadeleine.api.dto;

import com.stemadeleine.api.model.ArticleVariants;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateArticlePutRequest {
    private String name;
    private String title;
    private ArticleVariants variant;
    private Integer sortOrder;
    private String writer;
    private LocalDate writingDate;
}

