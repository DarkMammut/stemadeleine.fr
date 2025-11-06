package com.stemadeleine.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactDto {

    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String subject;
    private String message;
    private OffsetDateTime createdAt;
    private Boolean isRead;

    // Informations sur l'utilisateur lié si présent
    private UserContactInfo user;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserContactInfo {
        private UUID id;
        private String firstname;
        private String lastname;
        private String email;
    }
}
