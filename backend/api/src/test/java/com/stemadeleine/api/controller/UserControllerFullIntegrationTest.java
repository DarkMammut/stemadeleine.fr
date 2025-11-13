package com.stemadeleine.api.controller;

import com.stemadeleine.api.model.Membership;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.AccountRepository;
import com.stemadeleine.api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class UserControllerFullIntegrationTest {

    @Autowired
    private UserController controller;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    private User userWithMembership;

    @BeforeEach
    public void setup() {
        userRepository.deleteAll();
        accountRepository.deleteAll();

        User u1 = new User();
        u1.setFirstname("Normal");
        u1.setLastname("User");
        u1.setEmail("normal@example.com");
        userRepository.save(u1);

        User u2 = new User();
        u2.setFirstname("Adherent");
        u2.setLastname("User");
        u2.setEmail("adh@example.com");
        userRepository.save(u2);

        // membership for u2, active and dateFin this year
        Membership m = new Membership();
        m.setUser(u2);
        m.setActive(true);
        m.setDateAdhesion(LocalDate.now().minusDays(10));
        m.setDateFin(LocalDate.now().plusDays(10));
        m.setCreatedAt(java.time.OffsetDateTime.now());
        m.setUpdatedAt(java.time.OffsetDateTime.now());
        // use a mutable list so JPA can operate on the collection
        java.util.List<Membership> memberships = new java.util.ArrayList<>();
        memberships.add(m);
        u2.setMemberships(memberships);
        userRepository.save(u2);

        userWithMembership = u2;
    }

    @Test
    public void shouldReturnPageableUsers() {
        Page<com.stemadeleine.api.dto.UserBackofficeDto> page = controller.getAllUsers(PageRequest.of(0, 10));
        assertThat(page.getContent()).isNotNull();
    }

    @Test
    public void shouldReturnAdherentsPage() {
        ResponseEntity<Page<com.stemadeleine.api.dto.UserBackofficeDto>> resp = controller.getAdherents(PageRequest.of(0, 10));
        Page<com.stemadeleine.api.dto.UserBackofficeDto> page = resp.getBody();
        assertThat(page).isNotNull();
        assertThat(page.getContent()).isNotEmpty();
        assertThat(page.getContent().stream().findFirst().get().getFirstname()).isEqualTo(userWithMembership.getFirstname());
    }
}
