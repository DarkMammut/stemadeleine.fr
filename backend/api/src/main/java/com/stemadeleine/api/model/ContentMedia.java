package com.stemadeleine.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(name = "content_media")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentMedia {

    @EmbeddedId
    private ContentMediaId id;

    @ManyToOne
    @MapsId("contentId")
    @JoinColumn(name = "content_id", foreignKey = @ForeignKey(name = "content_media_content_id_fkey"))
    private Content content;

    @ManyToOne
    @MapsId("mediaId")
    @JoinColumn(name = "media_id", foreignKey = @ForeignKey(name = "content_media_media_id_fkey"))
    private Media media;

    @Column(name = "sort_order")
    private Short sortOrder;

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ContentMediaId implements Serializable {
        private UUID contentId;
        private UUID mediaId;
    }
}

