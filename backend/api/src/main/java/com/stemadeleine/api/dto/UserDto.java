package com.stemadeleine.api.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record UserDto(
        UUID id,
        String firstname,
        String lastname,
        String email,
        String phoneMobile,
        String phoneLandline,
        Boolean newsletter,
        String birthDate,
        Boolean isAdherent,
        List<MembershipDto> memberships,
        List<AccountDto> accounts,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        List<AddressDto> addresses
) {
}