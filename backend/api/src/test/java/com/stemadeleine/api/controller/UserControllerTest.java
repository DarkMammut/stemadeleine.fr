package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.UserBackofficeDto;
import com.stemadeleine.api.mapper.UserMapper;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UserControllerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserController controller;

    @BeforeEach
    public void setup() {
        // no MockMvc - directly call controller methods
    }

    @Test
    public void shouldReturnPageableUsers() {
        User u = new User();
        u.setId(UUID.randomUUID());
        u.setFirstname("Test");
        u.setLastname("User");

        // UserBackofficeDto has no builder; construct directly
        UserBackofficeDto dto = new UserBackofficeDto(u.getId(), u.getFirstname(), u.getLastname(), "", null, null, null, null, null, null, null, null);

        when(userRepository.findAll(any(org.springframework.data.domain.Pageable.class))).thenReturn(new PageImpl<>(List.of(u)));
        when(userMapper.toBackofficeDto(u)).thenReturn(dto);

        var page = controller.getAllUsers(org.springframework.data.domain.PageRequest.of(0, 10));
        org.assertj.core.api.Assertions.assertThat(page).isNotNull();
        org.assertj.core.api.Assertions.assertThat(page.getContent()).isNotEmpty();
    }
}
