package com.stemadeleine.api.security;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TestPassword {
    public static void main(String[] args) {
        String hash = "$2a$10$GIeBHC9bnbU28GMA8F8DauC1FHCJfTbXipuMmRtWnsiXyWnbt.GRe"; // ton hash
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        System.out.println("admin => " + encoder.matches("admin", hash)); // true attendu
        System.out.println("admin123 => " + encoder.matches("admin123", hash)); // false attendu
    }
}

