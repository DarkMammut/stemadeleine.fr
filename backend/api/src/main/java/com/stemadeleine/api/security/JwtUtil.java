package com.stemadeleine.api.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long expirationTime;

    private SecretKey key;

    @PostConstruct
    public void init() {
        if (secretKey == null) {
            logger.error("JWT secret key is null");
            throw new IllegalStateException("JWT secret key must not be null");
        }
        if (secretKey.length() < 32) {
            logger.warn("JWT secret key is less than 32 characters. This is not recommended for production.");
        }
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
        logger.info("JWT key has been initialized successfully");
    }

    public String generateToken(String username) {
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(key)
                .compact();
    }

    public String generateToken(org.springframework.security.core.Authentication authentication) {
        String username = authentication.getName();
        return generateToken(username);
    }

    public String extractUsername(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public String getEmailFromToken(String token) {
        return extractUsername(token);
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    public void invalidateToken(String token) {
        // Pour l'instant, on log simplement. Dans une vraie app, vous pourriez
        // utiliser une blacklist Redis ou une base de données
        logger.info("Token invalidated: {}", token.substring(0, Math.min(token.length(), 10)) + "...");
    }
}
