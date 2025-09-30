package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.AddressDto;
import com.stemadeleine.api.dto.UserBackofficeDto;
import com.stemadeleine.api.dto.UserDto;
import com.stemadeleine.api.mapper.UserBackofficeMapper;
import com.stemadeleine.api.model.Address;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.UserRepository;
import com.stemadeleine.api.service.HelloAssoImportService;
import com.stemadeleine.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserRepository userRepository;
    private final UserBackofficeMapper userBackofficeMapper;
    private final UserService userService;
    private final HelloAssoImportService helloAssoImportService;

    @GetMapping
    public java.util.List<UserBackofficeDto> getAllUsers() {
        return userBackofficeMapper.toDtoList(userRepository.findAll());
    }

    private UserDto toUserDto(User user) {
        java.util.List<AddressDto> addressesDto = null;
        if (user.getAddresses() != null) {
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
                user.getCreatedAt(),
                user.getUpdatedAt(),
                addressesDto
        );
    }

    private User toUserEntity(UserDto dto) {
        User user = new User();
        user.setId(dto.id());
        user.setFirstname(dto.firstname());
        user.setLastname(dto.lastname());
        user.setEmail(dto.email());
        user.setPhoneMobile(dto.phoneMobile());
        user.setPhoneLandline(dto.phoneLandline());
        user.setNewsletter(dto.newsletter());
        if (dto.birthDate() != null) {
            user.setBirthDate(java.time.LocalDate.parse(dto.birthDate()));
        }
        if (dto.addresses() != null) {
            java.util.List<Address> addresses = new java.util.ArrayList<>();
            for (AddressDto addressDto : dto.addresses()) {
                Address address = new Address();
                address.setName(addressDto.getName());
                address.setAddressLine1(addressDto.getAddressLine1());
                address.setAddressLine2(addressDto.getAddressLine2());
                address.setCity(addressDto.getCity());
                address.setPostCode(addressDto.getPostCode());
                address.setCountry(addressDto.getCountry());
                address.setOwnerId(user.getId());
                address.setOwnerType("USER");
                addresses.add(address);
            }
            user.setAddresses(addresses);
        }
        return user;
    }

    @PostMapping
    public UserDto createUser(@RequestBody UserDto dto) {
        User user = toUserEntity(dto);
        user = userRepository.save(user);
        return toUserDto(user);
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
        if (dto.birthDate() != null) {
            user.setBirthDate(java.time.LocalDate.parse(dto.birthDate()));
        }
        // On ne modifie plus les adresses ici
        user = userRepository.save(user);
        return toUserDto(user);
    }

    @GetMapping("/{id}")
    public UserBackofficeDto getUser(@PathVariable UUID id) {
        User user = userService.getUserById(id);
        return userBackofficeMapper.toDto(user);
    }

    @GetMapping("/adherents")
    public ResponseEntity<List<User>> getAdherents() {
        int currentYear = java.time.LocalDate.now().getYear();
        List<User> adherents = userRepository.findAll().stream()
                .filter(u -> u.getMemberships() != null && u.getMemberships().stream().anyMatch(m -> Boolean.TRUE.equals(m.getActive()) && m.getDateFin() != null && m.getDateFin().getYear() == currentYear))
                .toList();
        return ResponseEntity.ok(adherents);
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
}
