package com.stemadeleine.api.service;

import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.AddressRepository;
import com.stemadeleine.api.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

    public UserService(UserRepository userRepository, AddressRepository addressRepository) {
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User findById(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<com.stemadeleine.api.model.Address> addresses = addressRepository.findByOwnerId(user.getId());
        user.setAddresses(addresses);
        return user;
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public User update(UUID id, User updatedUser) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setFirstname(updatedUser.getFirstname());
                    user.setLastname(updatedUser.getLastname());
                    if (updatedUser.getAddresses() != null) {
                        updatedUser.getAddresses().forEach(address -> address.setOwnerId(user.getId()));
                        user.setAddresses(updatedUser.getAddresses());
                    }
                    user.setAccounts(updatedUser.getAccounts());
                    return userRepository.save(user);
                })
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public void delete(UUID id) {
        userRepository.deleteById(id);
    }

    public List<User> findAdherents() {
        return userRepository.findAll().stream()
                .filter(u -> u.getMemberships() != null && u.getMemberships().stream().anyMatch(m -> Boolean.TRUE.equals(m.getActive())))
                .toList();
    }
}
