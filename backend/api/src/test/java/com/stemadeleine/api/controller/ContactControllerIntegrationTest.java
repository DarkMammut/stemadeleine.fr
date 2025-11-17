package com.stemadeleine.api.controller;

import com.stemadeleine.api.model.Contact;
import com.stemadeleine.api.repository.ContactRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {"spring.jpa.hibernate.ddl-auto=create-drop"})
@ActiveProfiles("test")
@TestPropertySource(locations = "classpath:application-test.properties")
@Transactional
public class ContactControllerIntegrationTest {

    @Autowired
    private ContactController controller;

    @Autowired
    private ContactRepository contactRepository;

    @BeforeEach
    public void setup() {
        contactRepository.deleteAll();
    }

    @Test
    public void shouldCreateAndFetchContacts() {
        Contact c = new Contact();
        c.setFirstName("Test");
        c.setLastName("User");
        c.setEmail("test@example.com");
        c.setMessage("Hello");
        c.setCreatedAt(OffsetDateTime.now());
        contactRepository.save(c);

        var page = controller.getAllContacts(org.springframework.data.domain.PageRequest.of(0, 10));
        assertThat(page.getBody()).isNotNull();
        assertThat(page.getBody().getContent()).isNotEmpty();
    }
}
