package com.stemadeleine.api.security;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GeneratePasswordHash {
    public static void main(String[] args) {
        String rawPassword = "admin"; // le mot de passe à encoder
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash = encoder.encode(rawPassword);

        System.out.println("Mot de passe : " + rawPassword);
        System.out.println("Hash BCrypt : " + hash);
    }
}
