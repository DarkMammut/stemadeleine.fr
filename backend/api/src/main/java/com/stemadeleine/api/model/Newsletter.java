package com.stemadeleine.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(name = "newsletters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Newsletter extends Module {

    @Column(nullable = false, columnDefinition = "varchar(255) default 'LAST3'")
    private NewsVariants variant = NewsVariants.LAST3;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_date", nullable = false)
    private OffsetDateTime startDate;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "media_id", referencedColumnName = "id")
    private Media media;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "newsletter_id", referencedColumnName = "id")
    private List<Content> contents;
}
