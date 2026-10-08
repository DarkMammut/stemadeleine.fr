package com.stemadeleine.api.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
        name = "sections",
        indexes = {
                @Index(name = "idx_sections_section_id_version", columnList = "section_id, version DESC"),
                @Index(name = "idx_sections_section_id_status", columnList = "section_id, status"),
                @Index(name = "idx_sections_page_id_status", columnList = "page_id, status")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Section {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "section_id", nullable = false, updatable = false)
    private UUID sectionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "page_id", nullable = false, foreignKey = @ForeignKey(name = "sections_page_id_fkey"))
    private Page page;

    @Column(nullable = false)
    private String name;

    private String title;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "is_visible", nullable = false)
    private Boolean isVisible = true;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private PublishingStatus status = PublishingStatus.DRAFT;

    @Column(nullable = false)
    private Integer version = 1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "media_id", foreignKey = @ForeignKey(name = "sections_media_id_fkey"))
    private Media media;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false, foreignKey = @ForeignKey(name = "sections_author_id_fkey"))
    private User author;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    // Many-to-many relationship with Content through section_content table
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "section_content",
            joinColumns = @JoinColumn(name = "section_id"),
            inverseJoinColumns = @JoinColumn(name = "content_id")
    )
    private List<Content> contents;

    // One-to-many relationship with modules
    // A DRAFT section only has DRAFT modules and a PUBLISHED section only has PUBLISHED modules.
    // DELETED / ARCHIVED rows are excluded from the collection.
    @OneToMany(mappedBy = "section", fetch = FetchType.LAZY)
    @SQLRestriction("status in ('DRAFT', 'PUBLISHED')")
    private List<Module> modules;
}
