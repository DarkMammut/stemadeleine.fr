package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.UserBackofficeDto;
import com.stemadeleine.api.dto.UserDto;
import com.stemadeleine.api.mapper.UserBackofficeMapper;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserRepository userRepository;
    private final UserBackofficeMapper userBackofficeMapper;

    @GetMapping
    public java.util.List<UserBackofficeDto> getAllUsers() {
        return userBackofficeMapper.toDtoList(userRepository.findAll());
    }

    @PostMapping
    public UserDto createUser(@RequestBody UserDto dto) {
        User user = new User();
        user.setFirstname(dto.firstname());
        user.setLastname(dto.lastname());
        user.setEmail(dto.email());
        user.setPhoneMobile(dto.phoneMobile());
        user.setPhoneLandline(dto.phoneLandline());
        user.setNewsletter(dto.newsletter());
        if (dto.birthDate() != null) {
            user.setBirthDate(java.time.LocalDate.parse(dto.birthDate()));
        }
        user = userRepository.save(user);
        OffsetDateTime now = OffsetDateTime.now();
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
                null,
                now,
                now
        );
    }

    @PutMapping("/{id}")
    public UserDto updateUser(@PathVariable("id") java.util.UUID id, @RequestBody UserDto dto) {
        User user = userRepository.findById(id).orElseThrow();
        user.setFirstname(dto.firstname());
        user.setLastname(dto.lastname());
        user.setEmail(dto.email());
        user.setPhoneMobile(dto.phoneMobile());
        user.setPhoneLandline(dto.phoneLandline());
        user.setNewsletter(dto.newsletter());
        if (dto.birthDate() != null) {
            user.setBirthDate(java.time.LocalDate.parse(dto.birthDate()));
        }
        user = userRepository.save(user);
        OffsetDateTime now = OffsetDateTime.now();
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
                null,
                user.getCreatedAt() != null ? user.getCreatedAt() : now,
                now
        );
    }

    @GetMapping("/{id}")
    public UserBackofficeDto getUser(@PathVariable("id") java.util.UUID id) {
        return userBackofficeMapper.toDto(userRepository.findById(id).orElseThrow());
    }

    @GetMapping("/adherents")
    public ResponseEntity<List<User>> getAdherents() {
        int currentYear = java.time.LocalDate.now().getYear();
        List<User> adherents = userRepository.findAll().stream()
                .filter(u -> u.getMemberships() != null && u.getMemberships().stream().anyMatch(m -> Boolean.TRUE.equals(m.getActive()) && m.getDateFin() != null && m.getDateFin().getYear() == currentYear))
                .toList();
        return ResponseEntity.ok(adherents);
    }
}
