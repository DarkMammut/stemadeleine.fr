package com.stemadeleine.api.service;

import com.stemadeleine.api.model.Address;
import com.stemadeleine.api.model.Membership;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.AddressRepository;
import com.stemadeleine.api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UserServiceUnitTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private AccountService accountService;

    @Mock
    private MembershipService membershipService;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
    }

    @Test
    void getUserByIdLoadsRelatedData() {
        UUID id = UUID.randomUUID();
        User u = new User();
        u.setId(id);
        u.setFirstname("A");
        u.setLastname("B");

        when(userRepository.findById(id)).thenReturn(Optional.of(u));
        when(addressRepository.findByOwnerIdAndOwnerType(id, "USER")).thenReturn(List.of(new Address()));
        when(accountService.getAccountsByUserId(id)).thenReturn(List.of());
        when(membershipService.getMembershipsByUserId(id)).thenReturn(List.of(new Membership()));

        User res = userService.getUserById(id);
        assertThat(res).isNotNull();
        assertThat(res.getAddresses()).isNotEmpty();
        assertThat(res.getMemberships()).isNotEmpty();
    }
}
