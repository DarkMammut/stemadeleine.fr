package com.stemadeleine.api.dto;

import lombok.Data;

import java.util.List;

@Data
public class HelloAssoMembershipItemDto {
    private Long id;
    private Payer payer;
    private List<Answer> answers;

    @Data
    public static class Payer {
        private String firstName;
        private String lastName;
        private String email;
    }

    @Data
    public static class Answer {
        private String name;
        private String value;
    }
}

