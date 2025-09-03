package com.stemadeleine.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "modules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Inheritance(strategy = InheritanceType.JOINED)
public class Module {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private UUID moduleID;

    @Column(nullable = false)
    private Integer version;

    @ManyToOne(optional = false)
    @JoinColumn(name = "section_id", foreignKey = @ForeignKey(name = "modules_section_id_fkey"))
    private Section section;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String type;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "is_visible", nullable = false)
    private Boolean isVisible = true;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private PublishingStatus status = PublishingStatus.DRAFT;

    @ManyToOne
    @JoinColumn(name = "author_id", nullable = false, foreignKey = @ForeignKey(name = "pages_author_id_fkey"))
    private User author;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}