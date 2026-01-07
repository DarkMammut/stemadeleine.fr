package com.stemadeleine.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Entity
@Table(name = "newsletters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Newsletter extends Module {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NewsVariants variant = NewsVariants.LAST3;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "detail_page_url", length = 500)
    private String detailPageUrl;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "media_id", referencedColumnName = "id")
    private Media media;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "newsletter_id", referencedColumnName = "id")
    private List<Content> contents;
}
