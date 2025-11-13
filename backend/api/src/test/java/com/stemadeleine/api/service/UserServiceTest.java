package com.stemadeleine.api.service;

import com.stemadeleine.api.model.Account;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.AddressRepository;
import com.stemadeleine.api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

public class UserServiceTest {

    private UserRepository userRepository;
    private AddressRepository addressRepository;
    private AccountService accountService;
    private UserService userService;

    @BeforeEach
    public void setup() {
        userRepository = Mockito.mock(UserRepository.class);
        addressRepository = Mockito.mock(AddressRepository.class);
        accountService = Mockito.mock(AccountService.class);
        com.stemadeleine.api.service.MembershipService membershipService = Mockito.mock(com.stemadeleine.api.service.MembershipService.class);
        userService = new UserService(userRepository, addressRepository, accountService, membershipService);
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
        acc.setRole("ROLE_USER");

        when(accountService.getAccountsByUserId(id)).thenReturn(Collections.singletonList(acc));

        User result = userService.getUserById(id);

        assertThat(result).isNotNull();
        assertThat(result.getAccounts()).isNotNull();
        assertThat(result.getAccounts()).hasSize(1);
        assertThat(result.getAccounts().stream().findFirst().get().getRole()).isEqualTo("ROLE_USER");
    }
}
