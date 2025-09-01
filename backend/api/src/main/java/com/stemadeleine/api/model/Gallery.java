package com.stemadeleine.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "galleries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Gallery extends Module{

    @Column(nullable = false, columnDefinition = "varchar(255) default 'GRID'")
    private GalleryVariants variant = GalleryVariants.GRID;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "gallery_id", referencedColumnName = "id")
    private List<Media> medias;
}
