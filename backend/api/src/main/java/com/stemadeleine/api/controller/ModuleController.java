package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.CreateModuleRequest;
import com.stemadeleine.api.dto.ModuleDto;
import com.stemadeleine.api.mapper.ModuleMapper;
import com.stemadeleine.api.model.CustomUserDetails;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.service.ModuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/modules")
@RequiredArgsConstructor
public class ModuleController {

    private final ModuleService moduleService;
    private final ModuleMapper moduleMapper;

    @PostMapping
    public ResponseEntity<ModuleDto> createNewModule(@RequestBody CreateModuleRequest request, @AuthenticationPrincipal CustomUserDetails currentUserDetails) {

        if (currentUserDetails == null) {
            throw new RuntimeException("User not authenticated");
        }

        User currentUser = currentUserDetails.account().getUser();

        Module newModule = moduleService.createNewModule(
                request.sectionId(),
                request.name(),
                request.type(),
                currentUser
        );
        return ResponseEntity.ok(moduleMapper.toDto(newModule));
    }
}
