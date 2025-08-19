package com.stemadeleine.api.service;

import com.stemadeleine.api.model.UserAddress;
import com.stemadeleine.api.model.UserAddress.UserAddressId;
import com.stemadeleine.api.repository.UserAddressRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserAddressService {

    private final UserAddressRepository repository;

    public UserAddressService(UserAddressRepository repository) {
        this.repository = repository;
    }

    public List<UserAddress> findAll() {
        return repository.findAll();
    }

    public UserAddress findById(UserAddressId id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("UserAddress not found"));
    }

    public UserAddress save(UserAddress userAddress) {
        return repository.save(userAddress);
    }

    public UserAddress update(UserAddressId id, UserAddress updated) {
        return repository.findById(id)
                .map(existing -> {
                    existing.setUser(updated.getUser());
                    existing.setAddress(updated.getAddress());
                    return repository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("UserAddress not found"));
    }

    public void delete(UserAddressId id) {
        repository.deleteById(id);
    }
}