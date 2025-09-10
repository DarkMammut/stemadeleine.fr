// Account.java
package com.stemadeleine.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "accounts",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"email"}),
                @UniqueConstraint(columnNames = {"provider", "provider_account_id"})
        })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String email;

    @Column(name = "password_hash")
    private String password; // Renommé pour plus de clarté

    @Column(nullable = false)
    @Builder.Default
    private String provider = "local";

    @Column(name = "provider_account_id")
    private String providerAccountId;

    @Column(nullable = false)
    @Builder.Default
    private String role = "ROLE_USER";

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "email_verified")
    @Builder.Default
    private Boolean emailVerified = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
