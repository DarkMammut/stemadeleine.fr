package com.stemadeleine.api.dto;

import lombok.Data;

@Data
public class OrganizationInfoDTO {
    private String name;
    private String legalForm;
    private String siret;
    private String siren;
    private String vatNumber;
    private String apeCode;
}
