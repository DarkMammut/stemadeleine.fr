package com.stemadeleine.api.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampaignDto {
    private UUID id;
    private String title;
    private Integer collectedAmount;
    private String formType;
    private String state;
    private String currency;
    private String url;
    private String formSlug;
}
