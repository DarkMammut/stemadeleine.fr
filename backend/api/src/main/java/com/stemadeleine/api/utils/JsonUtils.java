package com.stemadeleine.api.utils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class JsonUtils {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static JsonNode createEmptyJsonNode() {
        return objectMapper.createObjectNode();
    }
}
