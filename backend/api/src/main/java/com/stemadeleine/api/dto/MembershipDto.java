package com.stemadeleine.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@AllArgsConstructor
public class MembershipDto {
    private UUID id;
    private UUID userId;
    private LocalDate dateAdhesion;
    private Boolean active;
    private LocalDate dateFin;
    private LocalDate updatedAt;
    private LocalDate createdAt;
}
