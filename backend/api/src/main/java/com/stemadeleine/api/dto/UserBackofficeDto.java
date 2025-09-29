package com.stemadeleine.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserBackofficeDto {
    private UUID id;
    private String firstname;
    private String lastname;
    private String email;
    private String phoneMobile;
    private String phoneLandline;
    private Boolean newsletter;
    private String birthDate;
    private Boolean isAdherent;
    private List<MembershipDto> memberships;
    private List<AccountDto> accounts;
    private List<AddressDto> addresses;
}
// ...fin du fichier, aucune autre classe ou package ici...
