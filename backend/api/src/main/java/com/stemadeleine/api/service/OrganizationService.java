package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.OrganizationDto;
import com.stemadeleine.api.dto.OrganizationInfoDTO;
import com.stemadeleine.api.dto.OrganizationSettingsDTO;
import com.stemadeleine.api.model.LegalInfo;
import com.stemadeleine.api.model.Media;
import com.stemadeleine.api.model.Organization;
import com.stemadeleine.api.repository.AddressRepository;
import com.stemadeleine.api.repository.MediaRepository;
import com.stemadeleine.api.repository.OrganizationRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static java.time.OffsetDateTime.now;

@Service
@RequiredArgsConstructor
public class OrganizationService {
    private final OrganizationRepository organizationRepository;
    private final MediaRepository mediaRepository;
    private final AddressRepository addressRepository;

    @Transactional
    public Organization updateInfo(UUID id, OrganizationInfoDTO dto) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Organization not found"));
        org.setName(dto.getName());
        if (org.getLegalInfo() == null) org.setLegalInfo(new LegalInfo());
        org.getLegalInfo().setLegalForm(dto.getLegalForm());
        org.getLegalInfo().setSiret(dto.getSiret());
        org.getLegalInfo().setSiren(dto.getSiren());
        org.getLegalInfo().setVatNumber(dto.getVatNumber());
        org.getLegalInfo().setApeCode(dto.getApeCode());
        return organizationRepository.save(org);
    }

    @Transactional
    public Organization updateSettings(UUID id, OrganizationSettingsDTO dto) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Organization not found"));
        if (dto.getSlug() != null) org.setSlug(dto.getSlug());
        if (dto.getDescription() != null) org.setDescription(dto.getDescription());
        if (dto.getPrimaryColor() != null) org.setPrimaryColor(dto.getPrimaryColor());
        if (dto.getSecondaryColor() != null) org.setSecondaryColor(dto.getSecondaryColor());
        return organizationRepository.save(org);
    }

    @Transactional
    public Organization updateLogo(UUID id, UUID mediaId) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Organization not found"));
        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new RuntimeException("Media not found"));
        media.setOwnerId(id);
        mediaRepository.save(media);
        org.setUpdatedAt(now());
        org.setLogo(media);
        return organizationRepository.save(org);
    }

    @Transactional
    public Organization deleteLogo(UUID id) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found with id: " + id));
        org.setLogo(null);
        org.setUpdatedAt(now());
        return organizationRepository.save(org);
    }

    public Organization getLastCreatedOrganization() {
        return organizationRepository.findTopByOrderByCreatedAtDesc()
                .orElseThrow(() -> new EntityNotFoundException("Aucune organisation trouvée"));
    }

    public OrganizationDto getLastCreatedOrganizationWithAddress() {
        Organization org = organizationRepository.findTopByOrderByCreatedAtDesc()
                .orElseThrow(() -> new EntityNotFoundException("Aucune organisation trouvée"));
        OrganizationDto dto = new OrganizationDto();
        dto.setId(org.getId());
        dto.setName(org.getName());
        dto.setDescription(org.getDescription());
        dto.setSlug(org.getSlug());
        dto.setPrimaryColor(org.getPrimaryColor());
        dto.setSecondaryColor(org.getSecondaryColor());
        dto.setCreationDate(org.getCreationDate());
        dto.setCreatedAt(org.getCreatedAt());
        dto.setUpdatedAt(org.getUpdatedAt());
        addressRepository.findByOwnerIdAndOwnerType(org.getId(), "ORGANIZATION")
                .stream().findFirst().ifPresent(dto::setAddress);
        dto.setLegalInfo(org.getLegalInfo());
        dto.setLogo(org.getLogo());
        return dto;
    }
}
