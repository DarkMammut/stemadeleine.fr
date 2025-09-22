package com.stemadeleine.api.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateContentRequest {
    private String title;
    private JsonNode body;
    private Boolean isVisible = true;
    private Integer sortOrder;
}

