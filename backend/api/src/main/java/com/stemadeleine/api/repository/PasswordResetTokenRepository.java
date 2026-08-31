package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.Account;
import com.stemadeleine.api.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {

    Optional<PasswordResetToken> findByToken(String token);

    Optional<PasswordResetToken> findByAccountAndUsedFalseAndExpiryDateAfter(
            Account account,
            LocalDateTime now
    );

    void deleteByExpiryDateBefore(LocalDateTime now);

    void deleteByAccount(Account account);
}
