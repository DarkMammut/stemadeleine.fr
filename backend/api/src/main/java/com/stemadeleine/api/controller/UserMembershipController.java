package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.MembershipDto;
import com.stemadeleine.api.model.Membership;
import com.stemadeleine.api.service.MembershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserMembershipController {
    private final MembershipService membershipService;

    @GetMapping("/{userId}/memberships")
    public ResponseEntity<List<MembershipDto>> getMembershipsForUser(@PathVariable UUID userId) {
        List<Membership> memberships = membershipService.getMembershipsByUserId(userId);
        List<MembershipDto> dtos = memberships.stream().map(m -> MembershipDto.builder()
                .id(m.getId())
                .userId(m.getUser() != null ? m.getUser().getId() : null)
                .dateAdhesion(m.getDateAdhesion())
                .active(m.getActive())
                .dateFin(m.getDateFin())
                .updatedAt(m.getUpdatedAt())
                .createdAt(m.getCreatedAt())
                .build()
        ).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
