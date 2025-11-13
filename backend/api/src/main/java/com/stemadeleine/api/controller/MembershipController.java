package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.MembershipDto;
import com.stemadeleine.api.mapper.MembershipMapper;
import com.stemadeleine.api.model.Membership;
import com.stemadeleine.api.service.MembershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/memberships")
@RequiredArgsConstructor
public class MembershipController {
    private final MembershipService membershipService;
    private final MembershipMapper membershipMapper;

    @PostMapping
    public ResponseEntity<MembershipDto> createMembership(@RequestParam UUID userId, @RequestBody com.stemadeleine.api.dto.MembershipDto dto) {
        Membership membership = membershipService.createMembership(userId, dto);
        MembershipDto response = membershipMapper.toDto(membership);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{membershipId}")
    public ResponseEntity<MembershipDto> updateMembership(@PathVariable UUID membershipId, @RequestBody com.stemadeleine.api.dto.MembershipDto dto) {
        Membership membership = membershipService.updateMembership(membershipId, dto);
        MembershipDto response = membershipMapper.toDto(membership);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<MembershipDto>> getMemberships(@RequestParam(required = false) UUID userId) {
        List<Membership> memberships;
        if (userId != null) {
            memberships = membershipService.getMembershipsByUserId(userId);
        } else {
            memberships = membershipService.getAllMemberships();
        }
        List<MembershipDto> dtos = membershipMapper.toDtoList(memberships);
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{membershipId}")
    public ResponseEntity<MembershipDto> getMembershipById(@PathVariable UUID membershipId) {
        Membership membership = membershipService.getMembershipById(membershipId);
        MembershipDto response = membershipMapper.toDto(membership);
        return ResponseEntity.ok(response);
    }
}
