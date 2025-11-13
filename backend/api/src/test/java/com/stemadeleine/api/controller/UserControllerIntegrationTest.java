package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.UserBackofficeDto;
import com.stemadeleine.api.mapper.UserMapper;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.UserRepository;
import com.stemadeleine.api.service.HelloAssoImportService;
import com.stemadeleine.api.service.UserService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

public class UserControllerIntegrationTest {

    @Test
    public void getAllUsers_pageable() throws Exception {
        UserRepository userRepository = Mockito.mock(UserRepository.class);
        UserMapper userMapper = Mockito.mock(UserMapper.class);
        UserService userService = Mockito.mock(UserService.class);
        com.stemadeleine.api.service.MembershipService membershipService = Mockito.mock(com.stemadeleine.api.service.MembershipService.class);
        HelloAssoImportService helloAssoImportService = Mockito.mock(HelloAssoImportService.class);

        UserController controller = new UserController(userRepository, userMapper, userService, membershipService, helloAssoImportService);

        User u = new User();
        u.setId(UUID.randomUUID());
        u.setFirstname("A");
        u.setLastname("B");

        Page<User> page = new PageImpl<>(List.of(u));
        when(userRepository.findAll(any(Pageable.class))).thenReturn(page);

        UserBackofficeDto dto = new UserBackofficeDto(u.getId(), u.getFirstname(), u.getLastname(), null, null, null, null, null, null, null, null, List.of());
        when(userMapper.toBackofficeDto(u)).thenReturn(dto);

        Page<UserBackofficeDto> result = controller.getAllUsers(PageRequest.of(0, 1));
        assertEquals(1, result.getContent().size());
        assertEquals(u.getId(), result.getContent().get(0).getId());
    }
}
