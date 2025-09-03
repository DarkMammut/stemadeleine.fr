package com.stemadeleine.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Entity
@Table(name = "galleries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Gallery extends Module {
    @Column(nullable = false, columnDefinition = "varchar(255) default 'GRID'")
    private GalleryVariants variant = GalleryVariants.GRID;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "gallery_id", referencedColumnName = "id")
    private List<Media> medias;
}
