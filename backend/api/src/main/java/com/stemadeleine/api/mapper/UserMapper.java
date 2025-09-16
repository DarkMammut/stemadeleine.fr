package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.AccountDto;
import com.stemadeleine.api.dto.UserDto;
import com.stemadeleine.api.model.User;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
public class UserMapper {

    public UserDto toDto(User user) {
        if (user == null) {
            return null;
        }

        List<AccountDto> accountsDto = null;

        // Check if accounts collection is initialized to avoid LazyInitializationException
        try {
            if (user.getAccounts() != null && Hibernate.isInitialized(user.getAccounts())) {
                accountsDto = user.getAccounts().stream()
                        .map(account -> new AccountDto(
                                account.getId(),
                                account.getEmail(),
                                account.getRole(),
                                account.getProvider(),
                                account.getCreatedAt(),
                                account.getUpdatedAt()
                        ))
                        .collect(Collectors.toList());
            } else {
                log.debug("User accounts collection is not initialized for user: {}", user.getId());
            }
        } catch (Exception e) {
            log.warn("Could not access user accounts for user: {} - {}", user.getId(), e.getMessage());
        }

        return new UserDto(
                user.getId(),
                user.getFirstname(),
                user.getLastname(),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                accountsDto
        );
    }

    public List<UserDto> toDtoList(List<User> users) {
        if (users == null) {
            return null;
        }
        return users.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}
