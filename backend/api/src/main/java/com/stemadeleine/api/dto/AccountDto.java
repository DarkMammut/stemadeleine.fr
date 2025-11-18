package com.stemadeleine.api.dto;

import com.stemadeleine.api.model.Roles;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class AccountDto {
    private UUID id;
    private UUID userId;
    private String email;
    private Roles role;
    private String provider;
    private Boolean isActive;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}