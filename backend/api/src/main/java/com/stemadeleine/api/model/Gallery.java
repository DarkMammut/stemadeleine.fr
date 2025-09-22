package com.stemadeleine.api.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Entity
@DiscriminatorValue("gallery")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class Gallery extends Module implements MediaAttachable {
    @ManyToMany
    @JoinTable(
            name = "gallery_medias",
            joinColumns = @JoinColumn(name = "gallery_id"),
            inverseJoinColumns = @JoinColumn(name = "media_id")
    )
    private List<Media> medias = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GalleryVariants variant = GalleryVariants.GRID;
}
