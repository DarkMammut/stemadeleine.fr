package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.AccountDto;
import com.stemadeleine.api.dto.AccountUserDto;
import com.stemadeleine.api.mapper.AccountMapper;
import com.stemadeleine.api.model.Account;
import com.stemadeleine.api.service.AccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;
    private final AccountMapper accountMapper;

    public AccountController(AccountService accountService, AccountMapper accountMapper) {
        this.accountService = accountService;
        this.accountMapper = accountMapper;
    }

    @GetMapping
    public ResponseEntity<List<AccountDto>> getAccounts(@RequestParam(required = false) UUID userId) {
        List<Account> accounts;
        if (userId != null) {
            accounts = accountService.getAccountsByUserId(userId);
        } else {
            accounts = accountService.getAllAccounts();
        }
        List<AccountDto> dtos = accountMapper.toDtoList(accounts);
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountDto> getAccountById(@PathVariable UUID id) {
        return accountService.findById(id)
                .map(accountMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<AccountDto> createAccount(@RequestBody Account account) {
        Account saved = accountService.save(account);
        return ResponseEntity.ok(accountMapper.toDto(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AccountDto> updateAccount(@PathVariable UUID id, @RequestBody Account account) {
        try {
            Account updated = accountService.update(id, account);
            return ResponseEntity.ok(accountMapper.toDto(updated));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/user")
    public ResponseEntity<AccountDto> updateAccountUser(@PathVariable UUID id, @RequestBody AccountUserDto payload) {
        try {
            Account updated = accountService.updateAccountUser(id, payload.getUserId());
            return ResponseEntity.ok(accountMapper.toDto(updated));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/active")
    public ResponseEntity<AccountDto> updateAccountActive(@PathVariable UUID id, @RequestBody com.stemadeleine.api.dto.AccountActiveDto payload) {
        try {
            Account updated = accountService.updateAccountActive(id, payload.getIsActive());
            return ResponseEntity.ok(accountMapper.toDto(updated));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable UUID id) {
        accountService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<?> changePassword(@PathVariable UUID id,
                                            @RequestBody com.stemadeleine.api.dto.PasswordChangeRequest req,
                                            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        try {
            accountService.changePassword(id, req.getCurrentPassword(), req.getNewPassword(), authorizationHeader);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("message", e.getMessage()));
        }
    }
}
