package com.stemadeleine.api.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lists")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class List extends Module{

    @Column(nullable = false, columnDefinition = "varchar(255) default 'CARD'")
    private ListVariants variant = ListVariants.CARD;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "list_id", referencedColumnName = "id")
    private java.util.List<Content> contents;
}
