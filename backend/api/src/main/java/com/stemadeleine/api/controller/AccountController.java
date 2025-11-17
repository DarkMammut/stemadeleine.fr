package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.AccountDto;
import com.stemadeleine.api.dto.AccountUserDto;
import com.stemadeleine.api.mapper.AccountMapper;
import com.stemadeleine.api.model.Account;
import com.stemadeleine.api.service.AccountService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

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
    public ResponseEntity<?> getAccounts(
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sortField,
            @RequestParam(required = false) String sortDir,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String provider,
            @RequestParam(required = false, name = "status") List<String> statuses
    ) {
        // If pagination requested (page param provided) - use paged search
        if (page != null) {
            int p = page != null ? page : 0;
            int s = size != null ? size : 10;
            Sort sort = Sort.unsorted();
            if (sortField != null) {
                sort = Sort.by(sortField);
                if ("desc".equalsIgnoreCase(sortDir)) sort = sort.descending();
                else sort = sort.ascending();
            }
            Pageable pageable = PageRequest.of(p, s, sort);

            Map<String, Object> filters = new HashMap<>();
            if (role != null) filters.put("role", role);
            if (provider != null) filters.put("provider", provider);
            if (statuses != null && !statuses.isEmpty()) filters.put("status", statuses);

            Page<Account> result = accountService.searchAccounts(pageable, search, filters);

            Map<String, Object> resp = new HashMap<>();
            resp.put("content", result.getContent().stream().map(accountMapper::toDto).collect(Collectors.toList()));
            resp.put("number", result.getNumber());
            resp.put("size", result.getSize());
            resp.put("totalPages", result.getTotalPages());
            resp.put("totalElements", result.getTotalElements());
            return ResponseEntity.ok(resp);
        }

        // legacy behavior: list all or by user
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
