package com.stemadeleine.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class HelloAssoFormDto {
    private String id;
    private String title;
    private String description;
    private String url;
    @JsonProperty("formSlug")
    private String formSlug;
    @JsonProperty("formType")
    private String formType;
    @JsonProperty("state")
    private String state;
    @JsonProperty("currency")
    private String currency;
}
