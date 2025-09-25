package com.stemadeleine.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "memberships")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Membership {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "date_adhesion")
    private LocalDate dateAdhesion;

    @Column(name = "active")
    private Boolean active;

    @Column(name = "date_fin")
    private LocalDate dateFin;

    @Column(name = "updated_at")
    private LocalDate updatedAt;

    @Column(name = "created_at")
    private LocalDate createdAt;
}
