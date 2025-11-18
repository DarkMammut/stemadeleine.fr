package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.AdminPasswordResetRequest;
import com.stemadeleine.api.service.AccountService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests unitaires pour AccountAdminController")
class AccountAdminControllerTest {

    @Mock
    private AccountService accountService;

    @InjectMocks
    private AccountAdminController accountAdminController;

    private UUID accountId;

    @BeforeEach
    void setUp() {
        accountId = UUID.randomUUID();
    }

    @Test
    @DisplayName("Devrait appeler resetPasswordByAdmin et retourner 204")
    void shouldResetPasswordByAdmin() {
        AdminPasswordResetRequest req = new AdminPasswordResetRequest("NewPass123!");

        doNothing().when(accountService).resetPasswordByAdmin(accountId, "NewPass123!", null);

        ResponseEntity<?> resp = accountAdminController.resetPasswordByAdmin(accountId, req, null);

        assertEquals(HttpStatus.NO_CONTENT, resp.getStatusCode());
        verify(accountService).resetPasswordByAdmin(accountId, "NewPass123!", null);
    }
}
