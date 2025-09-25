package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.MembershipDto;
import com.stemadeleine.api.model.Membership;
import com.stemadeleine.api.service.MembershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/memberships")
@RequiredArgsConstructor
public class MembershipController {
    private final MembershipService membershipService;

    @PostMapping
    public ResponseEntity<Membership> createMembership(@RequestParam UUID userId, @RequestBody MembershipDto dto) {
        Membership membership = membershipService.createMembership(userId, dto);
        return ResponseEntity.ok(membership);
    }

    @PutMapping("/{membershipId}")
    public ResponseEntity<Membership> updateMembership(@PathVariable UUID membershipId, @RequestBody MembershipDto dto) {
        Membership membership = membershipService.updateMembership(membershipId, dto);
        return ResponseEntity.ok(membership);
    }
}
