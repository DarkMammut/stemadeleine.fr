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
import java.util.List;
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
        // Only update active if provided (avoid writing null into non-nullable column)
        if (dto.getActive() != null) {
            membership.setActive(dto.getActive());
        }
        // Optionally update dates if provided
        if (dto.getDateAdhesion() != null) {
            membership.setDateAdhesion(dto.getDateAdhesion());
        }
        if (dto.getDateFin() != null) {
            membership.setDateFin(dto.getDateFin());
        }
        // updatedAt will be populated by @UpdateTimestamp on save
        // Ajoute d'autres champs modifiables si besoin
        return membershipRepository.save(membership);
    }

    // Récupère toutes les adhésions pour un utilisateur donné
    @Transactional(readOnly = true)
    public List<Membership> getMembershipsByUserId(UUID userId) {
        return membershipRepository.findByUser_Id(userId);
    }

    // Récupère toutes les adhésions
    @Transactional(readOnly = true)
    public List<Membership> getAllMemberships() {
        return membershipRepository.findAll();
    }

    // Récupère une adhésion par son id
    @Transactional(readOnly = true)
    public Membership getMembershipById(UUID membershipId) {
        return membershipRepository.findById(membershipId).orElseThrow();
    }
}
