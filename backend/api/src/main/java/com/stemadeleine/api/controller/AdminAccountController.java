package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.AdminPasswordResetRequest;
import com.stemadeleine.api.service.AccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/accounts")
public class AdminAccountController {

    private final AccountService accountService;

    public AdminAccountController(AccountService accountService) {
        this.accountService = accountService;
    }

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
