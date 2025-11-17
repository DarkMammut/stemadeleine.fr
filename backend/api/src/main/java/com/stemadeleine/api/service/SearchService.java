package com.stemadeleine.api.service;

import com.stemadeleine.api.model.PublishingStatus;
import com.stemadeleine.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchService {
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final ArticleRepository articleRepository;
    private final SectionRepository sectionRepository;
    private final PageRepository pageRepository;
    private final ModuleRepository moduleRepository;
    private final ContactRepository contactRepository;
    private final NewsletterRepository newsletterRepository;
    private final NewsRepository newsRepository;

    /**
     * Retourne un objet agrégé de suggestions par type.
     * Chaque item est normalisé : { id, title, subtitle, url, type, kind }
     */
    public Map<String, Object> searchAll(String q, int limitPerType) {
        var result = new HashMap<String, Object>();
        if (q == null || q.trim().isEmpty()) {
            result.put("users", List.of());
            result.put("payments", List.of());
            result.put("articles", List.of());
            result.put("sections", List.of());
            result.put("pages", List.of());
            result.put("modules", List.of());
            result.put("contacts", List.of());
            result.put("newsletters", List.of());
            result.put("news", List.of());
            return result;
        }

        String qLower = q.toLowerCase();

        // users: search repository (firstname/lastname/email)
        try {
            var usersPage = userRepository.search(qLower, PageRequest.of(0, limitPerType));
            List<Map<String, Object>> users = usersPage.getContent().stream().map(u -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", u.getId());
                String name = (u.getFirstname() == null ? "" : u.getFirstname()) + " " + (u.getLastname() == null ? "" : u.getLastname());
                m.put("title", name.trim().isEmpty() ? (u.getEmail() == null ? "Utilisateur" : u.getEmail()) : name.trim());
                m.put("subtitle", u.getEmail());
                m.put("url", "/users/" + u.getId());
                m.put("type", "Utilisateur");
                m.put("kind", "user");
                return m;
            }).collect(Collectors.toList());
            result.put("users", users);
        } catch (Exception e) {
            result.put("users", List.of());
        }

        // payments: simple search on reference or id
        try {
            var paymentsPage = paymentRepository.findAll(PageRequest.of(0, 50)); // fetch some and filter
            var payments = paymentsPage.getContent().stream()
                    .filter(p -> p != null && (
                            (p.getHelloAssoPaymentId() != null && p.getHelloAssoPaymentId().toLowerCase().contains(qLower)) ||
                                    (p.getId() != null && p.getId().toString().toLowerCase().contains(qLower)) ||
                                    (p.getFormSlug() != null && p.getFormSlug().toLowerCase().contains(qLower)) ||
                                    (p.getUser() != null && ((p.getUser().getFirstname() == null ? "" : p.getUser().getFirstname()) + " " + (p.getUser().getLastname() == null ? "" : p.getUser().getLastname())).toLowerCase().contains(qLower))
                    ))
                    .limit(limitPerType)
                    .map(p -> {
                        Map<String, Object> m = new HashMap<>();
                        m.put("id", p.getId());
                        String title = p.getHelloAssoPaymentId() != null ? p.getHelloAssoPaymentId() : (p.getId() == null ? "" : p.getId().toString());
                        m.put("title", title);
                        m.put("subtitle", p.getAmount() == null ? null : String.valueOf(p.getAmount()));
                        m.put("url", "/payments/" + p.getId());
                        m.put("type", "Compte");
                        m.put("kind", "payment");
                        return m;
                    }).collect(Collectors.toList());

            result.put("payments", payments);
        } catch (Exception e) {
            result.put("payments", List.of());
        }

        // articles: search by title/name
        try {
            var articles = articleRepository.findByStatusNot(PublishingStatus.DELETED).stream()
                    .filter(a -> a != null && ((a.getTitle() != null && a.getTitle().toLowerCase().contains(qLower)) || (a.getName() != null && a.getName().toLowerCase().contains(qLower))))
                    .limit(limitPerType)
                    .map(a -> {
                        Map<String, Object> m = new HashMap<>();
                        m.put("id", a.getId());
                        m.put("title", a.getTitle() != null ? a.getTitle() : a.getName());
                        m.put("subtitle", a.getSection() != null ? a.getSection().getName() : null);
                        m.put("url", a.getId() != null ? "/news/" + a.getId() : null);
                        m.put("type", "Article");
                        m.put("kind", "article");
                        return m;
                    }).collect(Collectors.toList());
            result.put("articles", articles);
        } catch (Exception e) {
            result.put("articles", List.of());
        }

        // news (actualités)
        try {
            var news = newsRepository.search(qLower, PageRequest.of(0, limitPerType)).stream().map(n -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", n.getId());
                m.put("title", n.getTitle() != null ? n.getTitle() : n.getName());
                m.put("subtitle", n.getSection() != null ? n.getSection().getName() : null);
                m.put("url", n.getId() != null ? "/news/" + n.getId() : null);
                m.put("type", "News");
                m.put("kind", "news");
                return m;
            }).collect(Collectors.toList());
            result.put("news", news);
        } catch (Exception e) {
            result.put("news", List.of());
        }

        // sections: visible sections, filter by name/title
        try {
            var sections = sectionRepository.findByIsVisibleTrue().stream()
                    .filter(s -> s != null && ((s.getName() != null && s.getName().toLowerCase().contains(qLower)) || (s.getTitle() != null && s.getTitle().toLowerCase().contains(qLower))))
                    .limit(limitPerType)
                    .map(s -> {
                        Map<String, Object> m = new HashMap<>();
                        m.put("id", s.getId());
                        m.put("title", s.getName() != null ? s.getName() : s.getTitle());
                        m.put("subtitle", s.getPage() != null ? s.getPage().getTitle() : null);
                        m.put("url", s.getId() != null ? "/pages/" + s.getPage().getId() + "#section-" + s.getSectionId() : null);
                        m.put("type", "Section");
                        m.put("kind", "section");
                        return m;
                    }).collect(Collectors.toList());
            result.put("sections", sections);
        } catch (Exception e) {
            result.put("sections", List.of());
        }

        // pages: search by title/name/slug using repo
        try {
            var pages = pageRepository.search(qLower, PageRequest.of(0, limitPerType)).stream().map(p -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", p.getId());
                m.put("title", p.getTitle() != null ? p.getTitle() : p.getSlug());
                m.put("subtitle", p.getSlug());
                m.put("url", p.getId() != null ? "/pages/" + p.getId() : null);
                m.put("type", "Page");
                m.put("kind", "page");
                return m;
            }).collect(Collectors.toList());
            result.put("pages", pages);
        } catch (Exception e) {
            result.put("pages", List.of());
        }

        // modules: search by name using repo
        try {
            var modules = moduleRepository.search(qLower, PageRequest.of(0, limitPerType)).stream().map(mo -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", mo.getId());
                m.put("title", mo.getName() != null ? mo.getName() : mo.getId().toString());
                m.put("subtitle", mo.getType());
                m.put("url", mo.getId() != null ? "/modules/" + mo.getId() : null);
                m.put("type", "Module");
                m.put("kind", "module");
                return m;
            }).collect(Collectors.toList());
            result.put("modules", modules);
        } catch (Exception e) {
            result.put("modules", List.of());
        }

        // contacts
        try {
            var contacts = contactRepository.findAll().stream()
                    .filter(c -> c != null && ((c.getFirstName() != null && c.getFirstName().toLowerCase().contains(qLower)) || (c.getLastName() != null && c.getLastName().toLowerCase().contains(qLower)) || (c.getEmail() != null && c.getEmail().toLowerCase().contains(qLower))))
                    .limit(limitPerType)
                    .map(c -> {
                        Map<String, Object> m = new HashMap<>();
                        m.put("id", c.getId());
                        m.put("title", (c.getFirstName() == null ? "" : c.getFirstName()) + " " + (c.getLastName() == null ? "" : c.getLastName()));
                        m.put("subtitle", c.getEmail());
                        m.put("url", c.getId() != null ? "/contacts/" + c.getId() : null);
                        m.put("type", "Contact");
                        m.put("kind", "contact");
                        return m;
                    }).collect(Collectors.toList());
            result.put("contacts", contacts);
        } catch (Exception e) {
            result.put("contacts", List.of());
        }

        // newsletters
        try {
            var newsletters = newsletterRepository.findByStatusNot(PublishingStatus.DELETED).stream()
                    .filter(n -> n != null && ((n.getTitle() != null && n.getTitle().toLowerCase().contains(qLower))))
                    .limit(limitPerType)
                    .map(n -> {
                        Map<String, Object> m = new HashMap<>();
                        m.put("id", n.getId());
                        m.put("title", n.getTitle());
                        m.put("subtitle", null);
                        m.put("url", n.getId() != null ? "/newsletters/" + n.getId() : null);
                        m.put("type", "Newsletter");
                        m.put("kind", "newsletter");
                        return m;
                    }).collect(Collectors.toList());
            result.put("newsletters", newsletters);
        } catch (Exception e) {
            result.put("newsletters", List.of());
        }

        return result;
    }
}
