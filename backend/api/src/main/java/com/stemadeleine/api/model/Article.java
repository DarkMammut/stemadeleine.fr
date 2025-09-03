package com.stemadeleine.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Entity
@Table(name = "articles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Article extends Module {

    @Column(nullable = false, columnDefinition = "varchar(255) default 'STAGGERED'")
    private ArticleVariants variant = ArticleVariants.STAGGERED;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "article_id", referencedColumnName = "id")
    private List<Content> contents;
}
