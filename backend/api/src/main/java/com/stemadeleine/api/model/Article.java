package com.stemadeleine.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "articles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Article extends Module {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ArticleVariants variant = ArticleVariants.STAGGERED;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "article_id", referencedColumnName = "id")
    private List<Content> contents;

    @Column(name = "writer")
    private String writer;

    @Column(name = "writing_date")
    private LocalDate writingDate;
}
