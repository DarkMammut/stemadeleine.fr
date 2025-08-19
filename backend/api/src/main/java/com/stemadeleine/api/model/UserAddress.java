package com.stemadeleine.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(name = "user_addresses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAddress {

    @EmbeddedId
    private UserAddressId id;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "user_addresses_user_id_fkey"))
    private User user;

    @ManyToOne
    @MapsId("addressId")
    @JoinColumn(name = "address_id", foreignKey = @ForeignKey(name = "user_addresses_address_id_fkey"))
    private Address address;

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserAddressId implements Serializable {
        private UUID userId;
        private UUID addressId;
        private String type;
    }
}
