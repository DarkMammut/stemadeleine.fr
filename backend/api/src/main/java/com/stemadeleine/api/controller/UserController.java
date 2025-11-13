package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.UserBackofficeDto;
import com.stemadeleine.api.dto.UserDto;
import com.stemadeleine.api.mapper.UserMapper;
import com.stemadeleine.api.model.CustomUserDetails;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.UserRepository;
import com.stemadeleine.api.service.HelloAssoImportService;
import com.stemadeleine.api.service.MembershipService;
import com.stemadeleine.api.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final UserService userService;
    private final MembershipService membershipService;
    private final HelloAssoImportService helloAssoImportService;

    @GetMapping
    public Page<UserBackofficeDto> getAllUsers(Pageable pageable) {
        Page<com.stemadeleine.api.model.User> page = userRepository.findAll(pageable);
        return page.map(userMapper::toBackofficeDto);
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
        if (dto.birthDate() != null) user.setBirthDate(java.time.LocalDate.parse(dto.birthDate()));
        if (dto.addresses() != null) {
            // minimal addressing: keep as before
            java.util.List<com.stemadeleine.api.model.Address> addresses = new java.util.ArrayList<>();
            for (com.stemadeleine.api.dto.AddressDto addressDto : dto.addresses()) {
                com.stemadeleine.api.model.Address address = new com.stemadeleine.api.model.Address();
                address.setName(addressDto.getName());
                address.setAddressLine1(addressDto.getAddressLine1());
                address.setAddressLine2(addressDto.getAddressLine2());
                address.setCity(addressDto.getCity());
                address.setPostCode(addressDto.getPostCode());
                address.setCountry(addressDto.getCountry());
                address.setOwnerType("USER");
                addresses.add(address);
            }
            user.setAddresses(addresses);
        }
        user = userRepository.save(user);
        return userMapper.toDto(user);
    }

    @PutMapping("/{id}")
    public UserDto updateUser(@PathVariable UUID id, @RequestBody UserDto dto) {
        User user = userRepository.findById(id).orElseThrow();
        user.setFirstname(dto.firstname());
        user.setLastname(dto.lastname());
        user.setEmail(dto.email());
        user.setPhoneMobile(dto.phoneMobile());
        user.setPhoneLandline(dto.phoneLandline());
        user.setNewsletter(dto.newsletter());
        if (dto.birthDate() != null) user.setBirthDate(java.time.LocalDate.parse(dto.birthDate()));
        user = userRepository.save(user);
        return userMapper.toDto(user);
    }

    @GetMapping("/{id}")
    public UserBackofficeDto getUser(@PathVariable UUID id) {
        User user = userService.getUserById(id);
        try {
            var memberships = membershipService.getMembershipsByUserId(id);
            user.setMemberships(memberships);
        } catch (Exception e) {
            // fallback: nothing
        }
        return userMapper.toBackofficeDto(user);
    }

    @GetMapping("/adherents")
    public ResponseEntity<Page<UserBackofficeDto>> getAdherents(Pageable pageable) {
        int currentYear = java.time.LocalDate.now().getYear();
        java.time.LocalDate start = java.time.LocalDate.of(currentYear, 1, 1);
        java.time.LocalDate end = java.time.LocalDate.of(currentYear, 12, 31);

        Page<com.stemadeleine.api.model.User> page = userRepository.findAdherentsBetweenDates(start, end, pageable);
        Page<UserBackofficeDto> dtoPage = page.map(userMapper::toBackofficeDto);
        return ResponseEntity.ok(dtoPage);
    }

    @PostMapping("/import")
    public ResponseEntity<String> importMembers(@RequestParam(value = "orgSlug", required = false) String orgSlug) {
        String slug = (orgSlug != null && !orgSlug.isBlank()) ? orgSlug : "les-amis-de-sainte-madeleine-de-la-jarrie";
        String formSlug = "formulaire-d-adhesion";
        helloAssoImportService.importMembershipUsers(
                slug,
                formSlug
        );
        return ResponseEntity.ok("Import members from HelloAsso successfull");
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
        if (customUserDetails == null) {
            log.warn("Attempt to fetch user without authentication");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UUID userId = customUserDetails.account().getUser().getId();
        User currentUser = userService.getUserById(userId);

        log.info("GET /api/users/me - Fetching current user: {} {} (id={})", currentUser.getFirstname(), currentUser.getLastname(), currentUser.getId());

        // log accounts count if present
        int accountsCount = currentUser.getAccounts() == null ? 0 : currentUser.getAccounts().size();
        log.debug("/api/users/me - user has {} accounts", accountsCount);

        UserDto userDto = userMapper.toDto(currentUser);
        log.debug("/api/users/me - returning UserDto with {} accounts", userDto.accounts() == null ? 0 : userDto.accounts().size());
        return ResponseEntity.ok(userDto);
    }
}
