package com.stemadeleine.api.service;

import com.stemadeleine.api.model.Account;
import com.stemadeleine.api.repository.AccountRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AccountService {

    private final AccountRepository accountRepository;

    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

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
                    account.setPasswordHash(accountDetails.getPasswordHash());
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
}
