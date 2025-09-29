package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.HelloAssoFormDto;
import com.stemadeleine.api.dto.HelloAssoMembershipItemDto;
import com.stemadeleine.api.dto.HelloAssoPaymentDto;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class HelloAssoImportService {
    private final HelloAssoService helloAssoService;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final MembershipRepository membershipRepository;
    private final CampaignRepository campaignRepository;
    private final PaymentRepository paymentRepository;

    @Transactional
    public void importMembershipUsers(String orgSlug, String formSlug) {
        log.info("Début de l'import HelloAsso pour orgSlug='{}', formSlug='{}'", orgSlug, formSlug);
        List<HelloAssoMembershipItemDto> items = helloAssoService.getMembershipItems(orgSlug, formSlug).block();
        if (items == null) {
            log.warn("Aucun item récupéré depuis HelloAsso pour orgSlug='{}', formSlug='{}'", orgSlug, formSlug);
            return;
        }
        int ajout = 0, ignores = 0, incomplets = 0;
        for (HelloAssoMembershipItemDto item : items) {
            User user = mapToUser(item);
            user = userRepository.save(user);
            userRepository.flush(); // Force la génération de l'id
            log.info("user.getId() avant création adresse : {}", user.getId());
            Address address = mapToAddress(item);
            if (address != null) {
                if (address.getName() == null || address.getName().isEmpty()) {
                    address.setName("Principal");
                }
                address.setOwnerId(user.getId());
                log.info("ownerId renseigné dans l'adresse : {}", address.getOwnerId());
                address = addressRepository.save(address);
                log.warn("TEST LOG WARN : userId={}, ownerId={} (doit s'afficher)", user.getId(), address != null ? address.getOwnerId() : null);
                if (user.getAddresses() == null) user.setAddresses(new java.util.ArrayList<>());
                user.getAddresses().add(address);
                user = userRepository.save(user);
            }
            int currentYear = java.time.LocalDate.now().getYear();
            final java.util.UUID userId = user.getId();
            boolean existsMembership = membershipRepository.findAll().stream()
                    .anyMatch(m -> m.getUser().getId().equals(userId) && m.getDateFin() != null && m.getDateFin().getYear() == currentYear);
            if (existsMembership) {
                log.info("Adhésion ignorée (déjà existante pour l'année en cours): {} {}", user.getFirstname(), user.getLastname());
                ignores++;
                continue;
            }
            Membership membership = Membership.builder()
                    .user(user)
                    .dateAdhesion(java.time.LocalDate.now())
                    .active(true)
                    .dateFin(java.time.LocalDate.of(currentYear, 12, 31))
                    .updatedAt(java.time.LocalDate.now())
                    .createdAt(java.time.LocalDate.now())
                    .build();
            membershipRepository.save(membership);
            log.info("Nouvel utilisateur ajouté: {} {}", user.getFirstname(), user.getLastname());
            ajout++;
        }
        log.info("Import terminé: {} ajout(s), {} ignoré(s), {} incomplet(s)", ajout, ignores, incomplets);
    }

    /**
     * Importation automatique quotidienne à 3h du matin.
     * Remplacez les slugs par ceux de votre organisation et formulaire HelloAsso.
     */
    @Scheduled(cron = "0 0 3 * * *") // Tous les jours à 3h du matin
    public void scheduledImport() {
        String orgSlug = "les-amis-de-sainte-madeleine-de-la-jarrie";
        importMembershipUsers(orgSlug, "formulaire-d-adhesion");
        importCampaigns(orgSlug);
        importPayments(orgSlug);
    }

    private User mapToUser(HelloAssoMembershipItemDto item) {
        User.UserBuilder builder = User.builder();
        if (item.getPayer() != null) {
            builder.firstname(item.getPayer().getFirstName());
            builder.lastname(item.getPayer().getLastName());
            builder.email(item.getPayer().getEmail());
        }
        if (item.getAnswers() != null) {
            for (HelloAssoMembershipItemDto.Answer answer : item.getAnswers()) {
                switch (answer.getName().toLowerCase()) {
                    case "nom":
                        builder.lastname(answer.getValue());
                        break;
                    case "prénom":
                    case "prenom":
                        builder.firstname(answer.getValue());
                        break;
                    case "date de naissance":
                        builder.birthDate(parseDate(answer.getValue()));
                        break;
                    case "téléphone":
                    case "telephone":
                        builder.phoneMobile(answer.getValue());
                        break;
                    case "email":
                        builder.email(answer.getValue());
                        break;
                    case "newsletter":
                        builder.newsletter(parseNewsletter(answer.getValue()));
                        break;
                }
            }
        }
        return builder.build();
    }

    private Address mapToAddress(HelloAssoMembershipItemDto item) {
        String addressLine1 = null, city = null, postCode = null;
        if (item.getAnswers() != null) {
            for (HelloAssoMembershipItemDto.Answer answer : item.getAnswers()) {
                switch (answer.getName().toLowerCase()) {
                    case "adresse":
                        addressLine1 = answer.getValue();
                        break;
                    case "ville":
                        city = answer.getValue();
                        break;
                    case "code postal":
                        postCode = answer.getValue();
                        break;
                }
            }
        }
        if (addressLine1 != null && city != null && postCode != null) {
            return Address.builder().addressLine1(addressLine1).city(city).postCode(postCode).country("France").build();
        }
        return null;
    }

    private LocalDate parseDate(String value) {
        try {
            return LocalDate.parse(value);
        } catch (Exception e) {
            return null;
        }
    }

    private Boolean parseNewsletter(String value) {
        if (value == null) return null;
        return value.trim().equalsIgnoreCase("oui") || value.trim().equalsIgnoreCase("yes");
    }

    @Transactional
    public void importCampaigns(String orgSlug) {
        log.info("Début de l'import des campagnes HelloAsso pour orgSlug='{}'", orgSlug);
        List<HelloAssoFormDto> forms = helloAssoService.getForms(orgSlug).block();
        log.info("Formulaires HelloAsso récupérés : {}", forms != null ? forms.stream().map(HelloAssoFormDto::getFormSlug).toList() : "Aucun");
        if (forms == null) {
            log.warn("Aucun formulaire récupéré depuis HelloAsso pour orgSlug='{}'", orgSlug);
            return;
        }
        int ajout = 0, maj = 0;
        for (HelloAssoFormDto form : forms) {
            String formSlug = form.getFormSlug();
            Campaign campaign = campaignRepository.findByFormSlug(formSlug)
                    .orElse(null);
            boolean isNew = (campaign == null);
            if (isNew) {
                campaign = Campaign.builder().formSlug(formSlug).build();
                ajout++;
            } else {
                if (campaign.getFormSlug() == null || campaign.getFormSlug().isBlank()) {
                    campaign.setFormSlug(formSlug);
                }
                maj++;
            }
            campaign.setTitle(form.getTitle());
            campaign.setDescription(form.getDescription());
            campaign.setUrl(form.getUrl());
            campaign.setFormType(form.getFormType());
            campaign.setState(form.getState());
            campaign.setCurrency(form.getCurrency());
            campaignRepository.save(campaign);
        }
        log.info("Import des campagnes terminé: {} ajout(s), {} mise(s) à jour", ajout, maj);
    }

    @Transactional
    public void importPayments(String orgSlug) {
        log.info("Début de l'import des paiements HelloAsso pour orgSlug='{}'", orgSlug);
        List<HelloAssoPaymentDto> payments = helloAssoService.getPayments(orgSlug).block();
        log.info("Paiements HelloAsso récupérés : {}", payments != null ? payments.stream().map(HelloAssoPaymentDto::getPaymentId).toList() : "Aucun");
        if (payments == null) {
            log.warn("Aucun paiement récupéré depuis HelloAsso pour orgSlug='{}'", orgSlug);
            return;
        }
        int ajout = 0, ignores = 0;
        for (HelloAssoPaymentDto dto : payments) {
            // Recherche du User
            User user = userRepository.findByFirstnameIgnoreCaseAndLastnameIgnoreCaseAndEmailIgnoreCase(
                    dto.getPayerFirstname(), dto.getPayerLastname(), dto.getPayerEmail()
            ).orElse(null);
            if (user == null) {
                // Création du User si non trouvé
                user = User.builder()
                        .firstname(dto.getPayerFirstname())
                        .lastname(dto.getPayerLastname())
                        .email(dto.getPayerEmail())
                        .birthDate(dto.getPayerBirthDate())
                        .build();
                user = userRepository.save(user);
            }
            Address address = null;
            if (dto.getPayerAddressLine1() != null && dto.getPayerCity() != null && dto.getPayerPostCode() != null) {
                address = Address.builder()
                        .addressLine1(dto.getPayerAddressLine1())
                        .addressLine2(dto.getPayerAddressLine2())
                        .city(dto.getPayerCity())
                        .state(dto.getPayerState())
                        .postCode(dto.getPayerPostCode())
                        .country(dto.getPayerCountry() != null ? dto.getPayerCountry() : "FRA")
                        .name("Principal")
                        .build();
                address.setOwnerId(user.getId());
                log.warn("[PAYMENT] Création adresse : userId={}, ownerId={}", user.getId(), address.getOwnerId());
                Address existingAddress = addressRepository.findByAddressLine1AndCityAndPostCodeAndCountry(
                        address.getAddressLine1(), address.getCity(), address.getPostCode(), address.getCountry()
                ).orElse(null);
                if (existingAddress == null) {
                    address = addressRepository.save(address);
                    addressRepository.flush();
                } else {
                    address = existingAddress;
                }
                user = userRepository.save(user);
            }
            boolean exists = paymentRepository.findAll().stream()
                    .anyMatch(p -> p.getHelloAssoPaymentId().equals(dto.getPaymentId()));
            if (exists) {
                ignores++;
                continue;
            }
            Payment payment = new Payment();
            payment.setHelloAssoPaymentId(dto.getPaymentId());
            payment.setUser(user);
            payment.setAmount(dto.getAmount());
            payment.setCurrency(dto.getCurrency());
            payment.setPaymentDate(dto.getPaymentDate());
            payment.setStatus(dto.getStatus());
            payment.setFormSlug(dto.getFormSlug());
            payment.setType(dto.getType());
            payment.setReceiptUrl(dto.getReceiptUrl());
            paymentRepository.save(payment);
            ajout++;
        }
        log.info("Import des paiements terminé: {} ajout(s), {} ignoré(s)", ajout, ignores);
    }
}
