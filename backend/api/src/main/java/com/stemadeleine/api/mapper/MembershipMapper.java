package com.stemadeleine.api.mapper;

import com.stemadeleine.api.dto.MembershipDto;
import com.stemadeleine.api.model.Membership;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class MembershipMapper {

    public MembershipDto toDto(Membership m) {
        if (m == null) return null;
        UUID userId = null;
        if (m.getUser() != null) userId = m.getUser().getId();
        return MembershipDto.builder()
                .id(m.getId())
                .userId(userId)
                .dateAdhesion(m.getDateAdhesion())
                .active(m.getActive())
                .dateFin(m.getDateFin())
                .updatedAt(m.getUpdatedAt())
                .createdAt(m.getCreatedAt())
                .build();
    }

    public List<MembershipDto> toDtoList(List<Membership> memberships) {
        if (memberships == null) return null;
        return memberships.stream().map(this::toDto).collect(Collectors.toList());
    }
}
