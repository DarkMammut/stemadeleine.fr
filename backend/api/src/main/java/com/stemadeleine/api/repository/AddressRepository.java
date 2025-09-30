package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.Address;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AddressRepository extends JpaRepository<Address, UUID> {
    Optional<Address> findByAddressLine1AndCityAndPostCodeAndCountry(String addressLine1, String city, String postCode, String country);

    List<Address> findByOwnerIdAndOwnerType(UUID ownerId, String ownerType);

    List<Address> findByOwnerId(UUID ownerId);
}
