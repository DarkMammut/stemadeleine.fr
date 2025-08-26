package com.stemadeleine.api.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record UserDto(
        UUID id,
        String firstname,
        String lastname,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        List<AccountDto> accounts
) {
}