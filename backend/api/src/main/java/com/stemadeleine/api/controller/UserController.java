package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.UserDto;
import com.stemadeleine.api.mapper.UserMapper;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> getAll() {
        return userService.findAll();
    }

    @GetMapping("/{id}")
    public UserDto getUser(@PathVariable UUID id) {
        User user = userService.getUserById(id); // récupère l'entité User
        return UserMapper.toDto(user);           // mappe vers DTO
    }

    @PostMapping
    public ResponseEntity<User> create(@RequestBody User user) {
        return ResponseEntity.ok(userService.save(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> update(@PathVariable UUID id, @RequestBody User user) {
        return ResponseEntity.ok(userService.update(id, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        userService.delete(id); // ✅ appelle bien l’instance, pas la classe
        return ResponseEntity.noContent().build();
    }
}