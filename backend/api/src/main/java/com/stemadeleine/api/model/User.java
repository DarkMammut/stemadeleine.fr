// User.java
package com.stemadeleine.api.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue
    private UUID id;

    private String firstname;
    private String lastname;

    private String email;
    @Column(name = "phone_mobile")
    private String phoneMobile;
    @Column(name = "phone_landline")
    private String phoneLandline;
    private Boolean newsletter;
    @Column(name = "birth_date")
    private java.time.LocalDate birthDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Account> accounts;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Membership> memberships;

    @OneToMany(cascade = CascadeType.ALL)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Address> addresses;

    // Helper method to get username (combination of firstname and lastname)
    public String getUsername() {
        if (firstname != null && lastname != null) {
            return firstname + " " + lastname;
        } else if (firstname != null) {
            return firstname;
        } else if (lastname != null) {
            return lastname;
        } else {
            return "Unknown User";
        }
    }
}
