package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.MembershipDto;
import com.stemadeleine.api.model.Membership;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.MembershipRepository;
import com.stemadeleine.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MembershipService {
    private final MembershipRepository membershipRepository;
    private final UserRepository userRepository;

    @Transactional
    public Membership createMembership(UUID userId, MembershipDto dto) {
        int currentYear = LocalDate.now().getYear();
        User user = userRepository.findById(userId).orElseThrow();
        boolean exists = membershipRepository.findAll().stream()
                .anyMatch(m -> m.getUser().getId().equals(userId) && m.getDateFin() != null && m.getDateFin().getYear() == currentYear);
        if (exists) throw new IllegalStateException("L'utilisateur a déjà une adhésion pour l'année en cours.");
        Membership membership = Membership.builder()
                .user(user)
                .dateAdhesion(dto.getDateAdhesion() != null ? dto.getDateAdhesion() : LocalDate.now())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .dateFin(dto.getDateFin() != null ? dto.getDateFin() : LocalDate.of(currentYear, 12, 31))
                .updatedAt(LocalDate.now())
                .createdAt(LocalDate.now())
                .build();
        return membershipRepository.save(membership);
    }

    @Transactional
    public Membership updateMembership(UUID membershipId, MembershipDto dto) {
        Membership membership = membershipRepository.findById(membershipId).orElseThrow();
        int currentYear = LocalDate.now().getYear();
        if (membership.getDateFin() == null || membership.getDateFin().getYear() != currentYear) {
            throw new IllegalStateException("Seule l'adhésion de l'année en cours peut être modifiée.");
        }
        membership.setActive(dto.getActive());
        membership.setUpdatedAt(LocalDate.now());
        // Ajoute d'autres champs modifiables si besoin
        return membershipRepository.save(membership);
    }
}
