package com.stemadeleine.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembershipDto {
    private UUID id;
    private UUID userId;
    private LocalDate dateAdhesion;
    private Boolean active;
    private LocalDate dateFin;
    private OffsetDateTime updatedAt;
    private OffsetDateTime createdAt;
}
