package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.AccountDto;
import com.stemadeleine.api.mapper.AccountMapper;
import com.stemadeleine.api.service.AccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    // Keep only endpoints that should remain public / non-admin
    @GetMapping("/{id}")
    public ResponseEntity<AccountDto> getAccountById(@PathVariable UUID id) {
        return accountService.findById(id)
                .map(accountMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
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
