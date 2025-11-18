package com.stemadeleine.api.service;

import com.stemadeleine.api.model.Account;
import com.stemadeleine.api.model.Roles;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.AddressRepository;
import com.stemadeleine.api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.mockito.MockitoAnnotations.openMocks;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests unitaires pour UserService")
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private AccountService accountService;

    @Mock
    private MembershipService membershipService;

    private UserService userService;

    private User testUser;
    private Account acc;

    @BeforeEach
    public void setup() {
        openMocks(this);
        userService = new UserService(userRepository, addressRepository, accountService, membershipService);

        testUser = User.builder()
                .id(UUID.randomUUID())
                .firstname("John")
                .lastname("Doe")
                .build();

        acc = new Account();
        acc.setId(UUID.randomUUID());
        acc.setEmail("test@example.com");
        acc.setProvider("local");
        acc.setRole(Roles.ROLE_USER);
        acc.setIsActive(true);
        acc.setEmailVerified(false);
    }

    @Test
    public void getUserById_includesAccounts() {
        UUID id = UUID.randomUUID();
        User user = new User();
        user.setId(id);
        user.setFirstname("T");
        user.setLastname("U");

        when(userRepository.findById(id)).thenReturn(Optional.of(user));
        when(addressRepository.findByOwnerIdAndOwnerType(id, "USER")).thenReturn(Collections.emptyList());

        Account acc = new Account();
        acc.setId(UUID.randomUUID());
        acc.setEmail("a@example.com");
        acc.setRole(Roles.ROLE_USER);

        when(accountService.getAccountsByUserId(id)).thenReturn(Collections.singletonList(acc));

        User result = userService.getUserById(id);

        assertThat(result).isNotNull();
        assertThat(result.getAccounts()).isNotNull();
        assertThat(result.getAccounts()).hasSize(1);
        assertThat(result.getAccounts().stream().findFirst().get().getRole()).isEqualTo(Roles.ROLE_USER);
    }
}
