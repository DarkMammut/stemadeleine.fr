package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.AccountDto;
import com.stemadeleine.api.model.Account;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class AccountMapper {
    public AccountDto toDto(Account ac) {
        if (ac == null) return null;
        return new AccountDto(
                ac.getId(),
                ac.getUser() != null ? ac.getUser().getId() : null,
                ac.getEmail(),
                ac.getRole(),
                ac.getProvider(),
                ac.getIsActive(),
                ac.getCreatedAt(),
                ac.getUpdatedAt()
        );
    }

    public List<AccountDto> toDtoList(List<Account> accounts) {
        if (accounts == null) return null;
        return accounts.stream().map(this::toDto).collect(Collectors.toList());
    }
}
