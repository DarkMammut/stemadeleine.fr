package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.AddressDto;
import com.stemadeleine.api.dto.UserBackofficeDto;
import com.stemadeleine.api.dto.UserDto;
import com.stemadeleine.api.model.User;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    private final AccountMapper accountMapper;
    private final MembershipMapper membershipMapper;

    @Autowired
    public UserMapper(AccountMapper accountMapper, MembershipMapper membershipMapper) {
        this.accountMapper = accountMapper;
        this.membershipMapper = membershipMapper;
    }

    public UserDto toDto(User user) {
        if (user == null) {
            return null;
        }

        java.util.List<AddressDto> addressesDto = null;
        if (user.getAddresses() != null && Hibernate.isInitialized(user.getAddresses())) {
            addressesDto = user.getAddresses().stream()
                    .map(a -> new AddressDto(
                            a.getId(),
                            a.getOwnerId(),
                            a.getOwnerType(),
                            a.getName(),
                            a.getAddressLine1(),
                            a.getAddressLine2(),
                            a.getCity(),
                            a.getState(),
                            a.getPostCode(),
                            a.getCountry()
                    ))
                    .collect(java.util.stream.Collectors.toList());
        }

        // Expose accounts (safe for front usage when needed), but do not include memberships here
        java.util.List<com.stemadeleine.api.dto.AccountDto> accountsDto = null;
        if (user.getAccounts() != null && Hibernate.isInitialized(user.getAccounts())) {
            accountsDto = accountMapper.toDtoList(user.getAccounts());
        }

        return new UserDto(
                user.getId(),
                user.getFirstname(),
                user.getLastname(),
                user.getEmail(),
                user.getPhoneMobile(),
                user.getPhoneLandline(),
                user.getNewsletter(),
                user.getBirthDate() != null ? user.getBirthDate().toString() : null,
                false,
                null,
                accountsDto,
                user.getCreatedAt(),
                user.getUpdatedAt(),
                addressesDto
        );
    }

    public java.util.List<UserDto> toDtoList(java.util.List<User> users) {
        if (users == null) {
            return null;
        }
        return users.stream()
                .map(this::toDto)
                .collect(java.util.stream.Collectors.toList());
    }

    // Backoffice mapping: compute isAdherent but do not include memberships/accounts (they are available via dedicated endpoints)
    public UserBackofficeDto toBackofficeDto(User user) {
        if (user == null) return null;

        // Determine if user is adherent for the current year using available memberships (do not rely on Hibernate proxies)
        boolean isAdherent = false;
        if (user.getMemberships() != null) {
            isAdherent = user.getMemberships().stream()
                    .anyMatch(m -> Boolean.TRUE.equals(m.getActive())
                            && m.getDateFin() != null
                            && m.getDateFin().getYear() == java.time.LocalDate.now().getYear());
        }

        java.util.List<AddressDto> addressesDto;
        if (user.getAddresses() != null && Hibernate.isInitialized(user.getAddresses())) {
            addressesDto = user.getAddresses().stream()
                    .map(a -> new AddressDto(
                            a.getId(),
                            a.getOwnerId(),
                            a.getOwnerType(),
                            a.getName(),
                            a.getAddressLine1(),
                            a.getAddressLine2(),
                            a.getCity(),
                            a.getState(),
                            a.getPostCode(),
                            a.getCountry()
                    )).collect(java.util.stream.Collectors.toList());
        } else {
            addressesDto = java.util.Collections.emptyList();
        }

        // Include memberships for backoffice DTO when available (do not rely on Hibernate proxy initialization)
        java.util.List<com.stemadeleine.api.dto.MembershipDto> membershipsDto;
        if (user.getMemberships() != null) {
            membershipsDto = membershipMapper.toDtoList(user.getMemberships());
        } else {
            membershipsDto = java.util.Collections.emptyList();
        }

        return new UserBackofficeDto(
                user.getId(),
                user.getFirstname(),
                user.getLastname(),
                user.getEmail(),
                user.getPhoneMobile(),
                user.getPhoneLandline(),
                user.getNewsletter(),
                user.getBirthDate() != null ? user.getBirthDate().toString() : null,
                isAdherent,
                membershipsDto,
                null, // accounts removed - use dedicated endpoints
                addressesDto
        );
    }

    public java.util.List<UserBackofficeDto> toBackofficeDtoList(java.util.List<User> users) {
        if (users == null) return null;
        return users.stream().map(this::toBackofficeDto).collect(java.util.stream.Collectors.toList());
    }
}
