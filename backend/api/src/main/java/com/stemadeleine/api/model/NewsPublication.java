package com.stemadeleine.api.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Entity representing an actual news publication with its content.
 * This is different from the News module which defines how news are displayed on pages.
 */
@Entity
@Table(name = "news_publications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NewsPublication {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "news_id", nullable = false, unique = true)
    private UUID newsId;

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

    // Single featured media for the news
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "media_id", foreignKey = @ForeignKey(name = "news_publications_media_id_fkey"))
    private Media media;

    // Author who created this news
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false, foreignKey = @ForeignKey(name = "news_publications_author_id_fkey"))
    private User author;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    // Many-to-many relationship with Content through news_content table
    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "news_content",
            joinColumns = @JoinColumn(name = "news_publication_id"),
            inverseJoinColumns = @JoinColumn(name = "content_id")
    )
    private List<Content> contents;
}
