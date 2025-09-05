package com.stemadeleine.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignupRequest(
        @NotBlank(message = "Email cannot be empty")
        @Email(message = "Email should be valid")
        String email,

        @NotBlank(message = "Password cannot be empty")
        @Size(min = 6, message = "Password should be at least 6 characters")
        String password,

        @NotBlank(message = "First name cannot be empty")
        String firstname,

        @NotBlank(message = "Last name cannot be empty")
        String lastname
) {
}
