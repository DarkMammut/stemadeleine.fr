package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.AccountDto;
import com.stemadeleine.api.dto.UserDto;
import com.stemadeleine.api.model.User;

import java.util.List;
import java.util.stream.Collectors;

public class UserMapper {

    public static UserDto toDto(User user) {
        List<AccountDto> accountsDto = user.getAccounts().stream()
                .map(account -> new AccountDto(
                        account.getId(),
                        account.getEmail(),
                        account.getRole(),
                        account.getProvider(),
                        account.getCreatedAt(),
                        account.getUpdatedAt()
                ))
                .collect(Collectors.toList());

        return new UserDto(
                user.getId(),
                user.getFirstname(),
                user.getLastname(),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                accountsDto
        );
    }
}
