package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.AccountDto;
import com.stemadeleine.api.dto.AccountUserDto;
import com.stemadeleine.api.dto.AdminPasswordResetRequest;
import com.stemadeleine.api.mapper.AccountMapper;
import com.stemadeleine.api.model.Account;
import com.stemadeleine.api.model.Roles;
import com.stemadeleine.api.service.AccountService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/accounts")
public class AccountAdminController {

    private final AccountService accountService;
    private final AccountMapper accountMapper;

    public AccountAdminController(AccountService accountService, AccountMapper accountMapper) {
        this.accountService = accountService;
        this.accountMapper = accountMapper;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
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
            int p = page;
            int s = (size != null) ? size : 10;
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

    // New endpoint: expose enum Roles values to frontend clients (admin only)
    @GetMapping("/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<String>> getRoles() {
        List<String> vals = Arrays.stream(Roles.values()).map(Enum::name).collect(Collectors.toList());
        return ResponseEntity.ok(vals);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AccountDto> createAccount(@RequestBody Account account) {
        Account saved = accountService.save(account);
        return ResponseEntity.ok(accountMapper.toDto(saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AccountDto> updateAccount(@PathVariable UUID id, @RequestBody Account account) {
        try {
            Account updated = accountService.update(id, account);
            return ResponseEntity.ok(accountMapper.toDto(updated));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/user")
    @PreAuthorize("hasRole('ADMIN')")
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAccount(@PathVariable UUID id) {
        accountService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // --- merged endpoint from AdminAccountController ---
    @PostMapping("/{id}/password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> resetPasswordByAdmin(@PathVariable UUID id,
                                                  @RequestBody AdminPasswordResetRequest req,
                                                  @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        try {
            accountService.resetPasswordByAdmin(id, req.getNewPassword(), authorizationHeader);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        }
    }
}
