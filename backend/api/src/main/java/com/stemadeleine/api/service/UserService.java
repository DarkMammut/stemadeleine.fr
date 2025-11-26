package com.stemadeleine.api.service;

import com.stemadeleine.api.model.Address;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.AddressRepository;
import com.stemadeleine.api.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final AccountService accountService;
    private final MembershipService membershipService;

    public UserService(UserRepository userRepository, AddressRepository addressRepository, AccountService accountService, MembershipService membershipService) {
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.accountService = accountService;
        this.membershipService = membershipService;
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    // Nouvelle méthode performante pour retrouver un utilisateur par email (ignorer la casse)
    public Optional<User> findByEmailIgnoreCase(String email) {
        if (email == null) return Optional.empty();
        return userRepository.findByEmailIgnoreCase(email.trim());
    }

    public User findById(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Retrieve user and ensure related addresses and accounts are populated.
     * This guarantees /api/users/me returns accounts even if the association was lazy.
     */
    public User getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // addresses (existing behavior)
        List<Address> addresses = addressRepository.findByOwnerIdAndOwnerType(user.getId(), "USER");
        user.setAddresses(addresses);

        // ensure accounts are loaded from repository/service (always)
        try {
            var accounts = accountService.getAccountsByUserId(user.getId());
            user.setAccounts(accounts);
            log.debug("Loaded {} accounts for user {}", accounts == null ? 0 : accounts.size(), user.getId());
        } catch (Exception e) {
            log.warn("Could not fetch accounts for user {}: {}", user.getId(), e.getMessage());
            user.setAccounts(java.util.Collections.emptyList());
        }

        // ensure memberships are loaded from membershipService (so backoffice DTO can include them)
        try {
            var memberships = membershipService.getMembershipsByUserId(user.getId());
            user.setMemberships(memberships);
            log.debug("Loaded {} memberships for user {}", memberships == null ? 0 : memberships.size(), user.getId());
        } catch (Exception e) {
            log.warn("Could not fetch memberships for user {}: {}", user.getId(), e.getMessage());
            user.setMemberships(java.util.Collections.emptyList());
        }

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
                        updatedUser.getAddresses().forEach(address -> address.setOwnerType("USER"));
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
