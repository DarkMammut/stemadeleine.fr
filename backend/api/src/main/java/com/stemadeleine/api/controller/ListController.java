package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.CreateListRequest;
import com.stemadeleine.api.dto.UpdateListRequest;
import com.stemadeleine.api.dto.ListDto;
import com.stemadeleine.api.mapper.ListMapper;
import com.stemadeleine.api.model.CustomUserDetails;
import com.stemadeleine.api.model.List;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.service.ListService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/lists")
@RequiredArgsConstructor
public class ListController {
    private final ListService listService;
    private final ListMapper listMapper;

    @PostMapping
    public ResponseEntity<ListDto> createList(@RequestBody CreateListRequest request, @AuthenticationPrincipal CustomUserDetails currentUserDetails) {
        if (currentUserDetails == null) {
            throw new RuntimeException("User not authenticated");
        }
        User currentUser = currentUserDetails.account().getUser();
        List list = listService.createList(request, currentUser);
        return ResponseEntity.ok(listMapper.toDto(list));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ListDto> updateList(@PathVariable UUID id, @RequestBody UpdateListRequest request) {
        return listService.updateList(id, request)
                .map(list -> ResponseEntity.ok(listMapper.toDto(list)))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> softDeleteList(@PathVariable UUID id) {
        boolean deleted = listService.softDeleteList(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}

