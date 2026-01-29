package com.stemadeleine.api.dto;

import com.stemadeleine.api.model.Address;
import com.stemadeleine.api.model.LegalInfo;
import com.stemadeleine.api.model.Media;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class OrganizationDto {
    private UUID id;
    private String name;
    private String description;
    private String slug;
    private String primaryColor;
    private String secondaryColor;
    private LocalDate creationDate;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private Address address;
    private LegalInfo legalInfo;
    private Media logo;
    private Media favicon;
}
