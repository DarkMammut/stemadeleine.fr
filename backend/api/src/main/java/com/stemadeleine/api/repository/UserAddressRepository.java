package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.UserAddress;
import com.stemadeleine.api.model.UserAddress.UserAddressId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAddressRepository extends JpaRepository<UserAddress, UserAddressId> {
}
