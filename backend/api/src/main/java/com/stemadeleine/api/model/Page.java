package com.stemadeleine.api.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "pages",
        uniqueConstraints = {@UniqueConstraint(columnNames = "slug")},
        indexes = {@Index(name = "idx_pages_slug", columnList = "slug")}
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Page {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(name = "sub_title", nullable = false)
    private String subTitle;

    @Column(columnDefinition = "text default ''")
    private String description;

    @Column(nullable = false, updatable = false)
    private String slug;

    @Column(name = "nav_position")
    private String navPosition;

    @Column
    private Short sortOrder;

    @ManyToOne
    @JoinColumn(name = "parent_page_id", foreignKey = @ForeignKey(name = "pages_parent_page_id_fkey"))
    private Page parentPage;

    @ManyToOne
    @JoinColumn(name = "hero_media_id", foreignKey = @ForeignKey(name = "pages_hero_media_id_fkey"))
    private Media heroMedia;

    @Column(name = "is_visible", nullable = false)
    private Boolean isVisible = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}