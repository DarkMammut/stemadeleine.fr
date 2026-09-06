package com.stemadeleine.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "list_contents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListContent {

    @Id
    @GeneratedValue
    private UUID id;

    // Côté propriétaire de la relation avec List (permet à Hibernate de
    // renseigner list_id directement à l'insertion, évitant une violation
    // de contrainte NOT NULL sur un OneToMany unidirectionnel classique).
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "list_id", referencedColumnName = "id", nullable = false)
    @JsonIgnore
    private com.stemadeleine.api.model.List list;

    @Column(nullable = false)
    private UUID contentId;

    private String title;

    @Column(columnDefinition = "jsonb")
    private JsonNode body;

    @Column(name = "is_visible", nullable = false)
    private Boolean isVisible = true;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "link_url", length = 1000)
    private String linkUrl;

    // Many-to-many relationship with Media through list_content_media table
    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "list_content_media",
            joinColumns = @JoinColumn(name = "list_content_id", referencedColumnName = "id"),
            inverseJoinColumns = @JoinColumn(name = "media_id")
    )
    private List<Media> medias = new ArrayList<>();
}
