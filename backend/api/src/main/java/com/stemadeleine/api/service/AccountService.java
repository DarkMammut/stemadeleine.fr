package com.stemadeleine.api.service;

import com.stemadeleine.api.model.Account;
import com.stemadeleine.api.repository.AccountRepository;
import com.stemadeleine.api.security.JwtUtil;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AccountService(AccountRepository accountRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // backward compatible methods
    public List<Account> findAll() {
        return accountRepository.findAll();
    }

    public Optional<Account> findById(UUID id) {
        return accountRepository.findById(id);
    }

    public Optional<Account> findByEmail(String email) {
        return accountRepository.findByEmail(email);
    }

    public Account save(Account account) {
        return accountRepository.save(account);
    }

    public Account update(UUID id, Account accountDetails) {
        return accountRepository.findById(id)
                .map(account -> {
                    account.setEmail(accountDetails.getEmail());
                    account.setPassword(accountDetails.getPassword());
                    account.setProvider(accountDetails.getProvider());
                    account.setProviderAccountId(accountDetails.getProviderAccountId());
                    account.setUser(accountDetails.getUser());
                    return accountRepository.save(account);
                })
                .orElseThrow(() -> new RuntimeException("Account not found with id " + id));
    }

    public void delete(UUID id) {
        accountRepository.deleteById(id);
    }

    // New convenience methods used by controller
    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    public List<Account> getAccountsByUserId(UUID userId) {
        return accountRepository.findByUser_Id(userId);
    }

    public Account getAccountById(UUID id) {
        return accountRepository.findById(id).orElse(null);
    }

    public Account updateAccountActive(UUID accountId, Boolean isActive) {
        Account account = accountRepository.findById(accountId).orElseThrow(() -> new RuntimeException("Account not found with id " + accountId));
        account.setIsActive(isActive != null ? isActive : false);
        return accountRepository.save(account);
    }

    // Attacher ou détacher un user d'un compte
    public Account updateAccountUser(UUID accountId, UUID userId) {
        Account account = accountRepository.findById(accountId).orElseThrow(() -> new RuntimeException("Account not found with id " + accountId));
        if (userId == null) {
            account.setUser(null);
        } else {
            // lazy setting: create a User reference object with id only to avoid extra lookup
            com.stemadeleine.api.model.User u = new com.stemadeleine.api.model.User();
            u.setId(userId);
            account.setUser(u);
        }
        return accountRepository.save(account);
    }

    // Search with pagination and filters using Specification
    public Page<Account> searchAccounts(Pageable pageable, String search, Map<String, Object> filters) {
        Specification<Account> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.trim().isEmpty()) {
                String like = "%" + search.trim().toLowerCase() + "%";
                predicates.add(
                        cb.or(
                                cb.like(cb.lower(root.get("email")), like),
                                cb.like(cb.lower(root.get("provider")), like)
                        )
                );
            }

            if (filters != null) {
                Object roleObj = filters.get("role");
                if (roleObj != null) {
                    predicates.add(cb.equal(root.get("role"), roleObj.toString()));
                }
                Object providerObj = filters.get("provider");
                if (providerObj != null) {
                    predicates.add(cb.equal(root.get("provider"), providerObj.toString()));
                }
                Object statusObj = filters.get("status");
                if (statusObj != null) {
                    // status can be a single string or a collection
                    if (statusObj instanceof Iterable) {
                        List<Predicate> statusPreds = new ArrayList<>();
                        for (Object s : (Iterable) statusObj) {
                            statusPreds.add(cb.equal(root.get("isActive"), Boolean.valueOf(s.toString())));
                        }
                        predicates.add(cb.or(statusPreds.toArray(new Predicate[0])));
                    } else {
                        predicates.add(cb.equal(root.get("isActive"), Boolean.valueOf(statusObj.toString())));
                    }
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return accountRepository.findAll(spec, pageable);
    }

    // New method: change password with basic validation (keeps old signature for compatibility)
    public void changePassword(UUID id, String currentPassword, String newPassword) {
        changePassword(id, currentPassword, newPassword, null);
    }

    // New method: change password and optionally invalidate the provided JWT token (from Authorization header)
    public void changePassword(UUID id, String currentPassword, String newPassword, String authorizationHeader) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found with id " + id));

        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("New password must be at least 8 characters");
        }

        // If account provider is not local, disallow password change here
        if (!"local".equalsIgnoreCase(account.getProvider())) {
            throw new RuntimeException("Cannot change password for external provider accounts");
        }

        // Verify current password
        if (currentPassword == null || !passwordEncoder.matches(currentPassword, account.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        if (passwordEncoder.matches(newPassword, account.getPassword())) {
            throw new IllegalArgumentException("New password must be different from current password");
        }

        account.setPassword(passwordEncoder.encode(newPassword));
        accountRepository.save(account);

        // Invalidate the JWT token provided in the Authorization header, if any
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);
            jwtUtil.invalidateToken(token);
        }
    }

    // New method for admin to reset a user's password without current password
    public void resetPasswordByAdmin(UUID id, String newPassword, String authorizationHeader) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found with id " + id));

        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("New password must be at least 8 characters");
        }

        if (!"local".equalsIgnoreCase(account.getProvider())) {
            throw new RuntimeException("Cannot change password for external provider accounts");
        }

        account.setPassword(passwordEncoder.encode(newPassword));
        accountRepository.save(account);

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);
            jwtUtil.invalidateToken(token);
        }
    }
}
