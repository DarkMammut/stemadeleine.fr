package com.stemadeleine.api.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class OrganizationSettingsDTO {
    private String slug;
    private String description;
    private String primaryColor;
    private String secondaryColor;
    private String accentColor;
    private String textColor;
    private UUID logoMedia;
    private UUID faviconMedia;
}
