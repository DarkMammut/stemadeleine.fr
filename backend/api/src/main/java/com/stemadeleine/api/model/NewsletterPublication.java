package com.stemadeleine.api.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Entity representing an actual newsletter publication with its content.
 * This is different from the Newsletter module which defines how newsletters are displayed on pages.
 */
@Entity
@Table(name = "newsletter_publications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NewsletterPublication {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "newsletter_id", nullable = false, unique = true)
    private UUID newsletterId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_visible", nullable = false)
    private Boolean isVisible = true;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private PublishingStatus status = PublishingStatus.DRAFT;

    @Column(name = "published_date")
    private OffsetDateTime publishedDate;

    // Single featured media for the newsletter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "media_id", foreignKey = @ForeignKey(name = "newsletter_publications_media_id_fkey"))
    private Media media;

    // Author who created this newsletter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false, foreignKey = @ForeignKey(name = "newsletter_publications_author_id_fkey"))
    private User author;

    // News publications linked to this newsletter
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "newsletter_news_links",
            joinColumns = @JoinColumn(name = "newsletter_publication_id"),
            inverseJoinColumns = @JoinColumn(name = "news_publication_id")
    )
    private List<NewsPublication> linkedNews = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    // Note: Contents are linked via Content.ownerId = this.newsletterId
    // This allows contents to be shared across all versions of the same newsletter
    // Use ContentService.getLatestContentsByOwner(newsletterId) to retrieve them
}
