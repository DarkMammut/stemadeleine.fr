package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.CreateFormRequest;
import com.stemadeleine.api.dto.FormDto;
import com.stemadeleine.api.mapper.FormMapper;
import com.stemadeleine.api.model.CustomUserDetails;
import com.stemadeleine.api.model.Form;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.service.FormService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/forms")
@RequiredArgsConstructor
public class FormController {
    private final FormService formService;
    private final FormMapper formMapper;

    @GetMapping
    public List<FormDto> getAllForms() {
        return formService.getAllForms().stream().map(formMapper::toDto).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<FormDto> getFormById(@PathVariable UUID id) {
        return formService.getFormById(id)
                .map(formMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<FormDto> createForm(@RequestBody CreateFormRequest request, @AuthenticationPrincipal CustomUserDetails currentUserDetails) {
        if (currentUserDetails == null) {
            throw new RuntimeException("User not authenticated");
        }
        User currentUser = currentUserDetails.account().getUser();
        Form form = formService.createFormWithModule(request, currentUser);
        return ResponseEntity.ok(formMapper.toDto(form));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FormDto> updateForm(@PathVariable UUID id, @RequestBody Form details) {
        try {
            return ResponseEntity.ok(formMapper.toDto(formService.updateForm(id, details)));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteForm(@PathVariable UUID id) {
        formService.softDeleteForm(id);
        return ResponseEntity.noContent().build();
    }
}

