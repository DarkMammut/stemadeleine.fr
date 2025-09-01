package com.stemadeleine.api.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "articles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Article extends Module{

    @Column(nullable = false, columnDefinition = "varchar(255) default 'STAGGERED'")
    private ArticleVariants variant = ArticleVariants.STAGGERED;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "article_id", referencedColumnName = "id")
    private List<Content> contents;
}

