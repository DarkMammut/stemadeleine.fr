package com.stemadeleine.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class LegalInfo {
    @Column(name = "legal_form")
    private String legalForm;
    private String siret;
    private String siren;
    @Column(name = "vat_number")
    private String vatNumber;
    @Column(name = "ape_code")
    private String apeCode;
}
