package com.stemadeleine.api.model;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public record CustomUserDetails(Account account) implements UserDetails {

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Le rôle contient déjà le préfixe ROLE_ (ex: "ROLE_USER", "ROLE_ADMIN")
        return List.of(new SimpleGrantedAuthority(account.getRole()));
    }

    @Override
    public String getPassword() {
        return account.getPassword();
    }

    @Override
    public String getUsername() {
        return account.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return account.getIsActive();
    }

    @Override
    public boolean isAccountNonLocked() {
        return account.getIsActive();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return account.getIsActive() && account.getEmailVerified();
    }
}
