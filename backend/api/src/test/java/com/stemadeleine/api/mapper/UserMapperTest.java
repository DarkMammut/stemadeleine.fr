package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.UserDto;
import com.stemadeleine.api.model.Account;
import com.stemadeleine.api.model.Roles;
import com.stemadeleine.api.model.User;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

public class UserMapperTest {

    @Test
    public void toDto_includesAccounts_whenAccountsPresent() {
        AccountMapper accountMapper = new AccountMapper();
        MembershipMapper membershipMapper = new MembershipMapper();
        UserMapper userMapper = new UserMapper(accountMapper, membershipMapper);

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setFirstname("Test");
        user.setLastname("User");

        Account acc = new Account();
        acc.setId(UUID.randomUUID());
        acc.setEmail("admin@example.com");
        acc.setRole(Roles.ROLE_ADMIN);
        acc.setUser(user);

        user.setAccounts(Collections.singletonList(acc));

        UserDto dto = userMapper.toDto(user);

        assertThat(dto).isNotNull();
        assertThat(dto.accounts()).isNotNull();
        assertThat(dto.accounts()).hasSize(1);
        assertThat(dto.accounts().stream().findFirst().get().getRole()).isEqualTo(Roles.ROLE_ADMIN);
    }
}
