package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.AccountDto;
import com.stemadeleine.api.dto.MembershipDto;
import com.stemadeleine.api.dto.UserBackofficeDto;
import com.stemadeleine.api.model.User;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class UserBackofficeMapper {
    public UserBackofficeDto toDto(User user) {
        if (user == null) return null;
        List<MembershipDto> membershipsDto = null;
        boolean isAdherent = false;
        if (user.getMemberships() != null && Hibernate.isInitialized(user.getMemberships())) {
            membershipsDto = user.getMemberships().stream().map(m -> new MembershipDto(
                    m.getId(),
                    user.getId(),
                    m.getDateAdhesion(),
                    m.getActive(),
                    m.getDateFin(),
                    m.getUpdatedAt(),
                    m.getCreatedAt()
            )).collect(Collectors.toList());
            isAdherent = user.getMemberships().stream().anyMatch(m -> Boolean.TRUE.equals(m.getActive()) && m.getDateFin() != null && m.getDateFin().getYear() == java.time.LocalDate.now().getYear());
        }
        List<AccountDto> accountsDto = null;
        if (user.getAccounts() != null && Hibernate.isInitialized(user.getAccounts())) {
            accountsDto = user.getAccounts().stream().map(a -> new AccountDto(
                    a.getId(),
                    a.getEmail(),
                    a.getRole(),
                    a.getProvider() != null ? a.getProvider() : null,
                    a.getCreatedAt(),
                    a.getUpdatedAt()
            )).collect(Collectors.toList());
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
                accountsDto
        );
    }

    public List<UserBackofficeDto> toDtoList(List<User> users) {
        if (users == null) return null;
        return users.stream().map(this::toDto).collect(Collectors.toList());
    }
}
