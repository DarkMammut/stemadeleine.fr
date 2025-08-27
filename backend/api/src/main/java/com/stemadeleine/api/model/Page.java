package com.stemadeleine.api.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
        name = "pages",
        indexes = {@Index(name = "idx_pages_page_id_version", columnList = "page_id, version DESC")}
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

    @Column(name = "page_id", nullable = false, updatable = false)
    private UUID pageId;

    @Column(nullable = false)
    private Integer version;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String title;

    @Column(name = "sub_title")
    private String subTitle;

    @Column(columnDefinition = "text default ''")
    private String description;

    @Column(nullable = false, updatable = false)
    private String slug;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private PublishingStatus status = PublishingStatus.DRAFT;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @ManyToOne
    @JoinColumn(name = "parent_page_id", foreignKey = @ForeignKey(name = "pages_parent_page_id_fkey"))
    private Page parentPage;

    @ManyToOne
    @JoinColumn(name = "hero_media_id", foreignKey = @ForeignKey(name = "pages_hero_media_id_fkey"))
    private Media heroMedia;

    @ManyToOne
    @JoinColumn(name = "author_id", nullable = false, foreignKey = @ForeignKey(name = "pages_author_id_fkey"))
    private User author;

    @OneToMany(mappedBy = "parentPage", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Page> children;

    @OneToMany(mappedBy = "page", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Section> sections = new ArrayList<>();


    @Column(name = "is_visible", nullable = false)
    private Boolean isVisible = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}